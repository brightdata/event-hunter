from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import json
import os
from datetime import datetime
from deepagents import create_deep_agent
from langchain.chat_models import init_chat_model
from langchain_mcp_adapters.client import MultiServerMCPClient
from dotenv import load_dotenv
import logging

load_dotenv()

app = FastAPI(title="Event Hunter API", description="AI-powered event discovery service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class QueryRequest(BaseModel):
    query: str

# Global agent instance
agent = None

async def initialize_agent():
    """Initialize the deep agent with MCP tools"""
    global agent
    
    try:
        # Collect MCP tools from BrightData
        brightdata_token = os.getenv("BRIGHTDATA_API_TOKEN")
        if not brightdata_token:
            raise ValueError("BRIGHTDATA_API_TOKEN not found in environment variables")
        
        mcp_client = MultiServerMCPClient({
            "brightdata": {
                "url": f"https://mcp.brightdata.com/sse?token={brightdata_token}",
                "transport": "sse",
            }
        })
        mcp_tools = await mcp_client.get_tools()
        
        logger.info(f"Available MCP tools: {[tool.name for tool in mcp_tools]}")
        
        # Get OpenAI configuration from environment
        openai_api_key = os.getenv("OPENAI_API_KEY")
        openai_base_url = os.getenv("OPENAI_BASE_URL")
        
        if not openai_api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
        if not openai_base_url:
            raise ValueError("OPENAI_BASE_URL not found in environment variables")
        
        model = init_chat_model(
            model="gpt-4.1-mini",
            model_provider="openai",
            api_key=openai_api_key,
            base_url=openai_base_url,
            default_query={"api-version": "preview"}
        )

        # Event Search Sub-Agent
        current_date = datetime.now().strftime("%B %d, %Y")
        event_search_prompt = f"""You are an expert event finder. Your job is to search for industry events based on specific criteria.

        IMPORTANT: Today's date is {current_date}. When searching for events, always consider this current date and look for upcoming events, not past ones.

        You will receive:
        - Industry (e.g., "AI", "fintech", "healthcare")  
        - Timeframe (e.g., "2025", "Q1 2025", "next 6 months")
        - Geographic location (e.g., "USA", "Europe", "San Francisco")

        You have access to the search_engine tool which can scrape search results from Google, Bing or Yandex.

        Your task:
        1. Use the search_engine tool to find relevant industry events
        2. Search for conferences, trade shows, summits, workshops, hackathons, and similar events
        3. Return a list of events you found with basic information (name, URL, brief description)

        Focus on finding events that match ALL three criteria. Use multiple search queries with different combinations of keywords.

        Example search queries you might use:
        - "{{industry}} hackathon {{timeframe}} {{location}}"
        - "{{industry}} conference {{timeframe}} {{location}}"
        - "{{industry}} summit {{year}} {{location}}"
        - "{{industry}} events {{location}} {{timeframe}}"

        Return your findings in a simple list format:
        - Event Name: URL - Brief description

        Do NOT try to extract detailed information - focus only on FINDING events."""

        event_search_agent = {
            "name": "event-search-agent",
            "description": "Finds industry events based on industry, timeframe, and location criteria. Give this agent clear search parameters.",
            "prompt": event_search_prompt,
        }

        # Event Details Sub-Agent  
        event_details_prompt = f"""You are an event details extractor. Your job is to get comprehensive information about specific events.

        IMPORTANT: Today's date is {current_date}. When evaluating event dates, remember this context.

        You will receive URLs of events that need detailed information extracted.

        Your task:
        1. Use the scrape_as_markdown tool to get the content from each event URL
        2. Extract the following information for each event:
           - Event Name
           - Date(s)
           - Location (city, venue if available)
           - Main statement/description
           - Whether CFP (Call for Papers) is open
           - Whether sponsorship opportunities are available
           - Link to the event

        Format your response as:
        **Event Name**: [Name]
        **Link**: [URL]
        **Date**: [Date]
        **Location**: [Location]
        **Main Statement**: [Brief description of what the event is about]
        **Open CFP**: [Yes/No - with details if available]
        **Open Sponsorship**: [Yes/No - with details if available]

        If information is not available, mark it as "Not specified" rather than guessing."""

        event_details_agent = {
            "name": "event-details-agent", 
            "description": "Extracts detailed information from event URLs. Give this agent specific event URLs to analyze.",
            "prompt": event_details_prompt,
        }

        # Main Event Hunter Instructions
        event_hunter_instructions = f"""You are an expert Event Hunter. Your job is to find comprehensive information about industry events.

        IMPORTANT: Today's date is {current_date}. Always search for upcoming events relative to this date.

        You will receive input with:
        - Industry
        - Timeframe  
        - Geographic location (geo)

        Your workflow:
        1. First, use the event-search-agent to find relevant events based on the criteria
        2. Then, use the event-details-agent to extract detailed information from the event URLs found
        3. Compile a final report with all events in the requested format

        Final output format for each event:
        **Event Name**: [Name]
        **Link**: [URL]  
        **Date**: [Date]
        **Location**: [Location]
        **Main Statement**: [Brief description]
        **Open CFP**: [Yes/No with details]
        **Open Sponsorship**: [Yes/No with details]

        Keep the process simple:
        - Search agent finds events
        - Details agent extracts information  
        - You compile the final list

        Be thorough but efficient. Focus on finding 5-15 high-quality, relevant events rather than hundreds of low-quality results."""

        # Create the Event Hunter agent
        agent = create_deep_agent(
            tools=mcp_tools,
            model=model,
            instructions=event_hunter_instructions,
            subagents=[event_search_agent, event_details_agent],
        ).with_config({"recursion_limit": 1000})
        
        logger.info("Agent initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize agent: {e}")
        raise e

@app.on_event("startup")
async def startup_event():
    """Initialize the agent on startup"""
    await initialize_agent()

@app.get("/")
async def root():
    return {"message": "Event Hunter API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "agent_ready": agent is not None}

@app.post("/query")
async def query_events(request: QueryRequest):
    """Non-streaming endpoint for event queries"""
    if not agent:
        raise HTTPException(status_code=500, detail="Agent not initialized")
    
    try:
        response = await agent.ainvoke(
            {"messages": [{"role": "user", "content": request.query}]}
        )
        
        # Extract the final message content
        final_message = response["messages"][-1].content if response.get("messages") else "No response generated"
        
        return {
            "query": request.query,
            "response": final_message,
            "status": "completed"
        }
        
    except Exception as e:
        logger.error(f"Error processing query: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

@app.websocket("/ws/query")
async def websocket_query(websocket: WebSocket):
    """WebSocket endpoint for streaming event queries"""
    await websocket.accept()
    
    if not agent:
        await websocket.send_json({
            "type": "error",
            "message": "Agent not initialized"
        })
        await websocket.close()
        return
    
    try:
        while True:
            # Receive query from client
            data = await websocket.receive_text()
            query_data = json.loads(data)
            query = query_data.get("query", "")
            
            if not query:
                await websocket.send_json({
                    "type": "error",
                    "message": "Query is required"
                })
                continue
            
            # Send acknowledgment
            await websocket.send_json({
                "type": "start",
                "message": "Processing your query...",
                "query": query
            })
            
            try:
                # Stream the agent response
                async for chunk in agent.astream(
                    {"messages": [{"role": "user", "content": query}]},
                    stream_mode="values"
                ):
                    if "messages" in chunk and chunk["messages"]:
                        latest_message = chunk["messages"][-1]
                        
                        # Send the streaming content
                        await websocket.send_json({
                            "type": "stream",
                            "content": latest_message.content if hasattr(latest_message, 'content') else str(latest_message),
                            "role": getattr(latest_message, 'role', 'assistant')
                        })
                
                # Send completion signal
                await websocket.send_json({
                    "type": "complete",
                    "message": "Query processing completed"
                })
                
            except Exception as e:
                logger.error(f"Error during streaming: {e}")
                await websocket.send_json({
                    "type": "error",
                    "message": f"Error processing query: {str(e)}"
                })
                
    except WebSocketDisconnect:
        logger.info("Client disconnected from WebSocket")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        try:
            await websocket.send_json({
                "type": "error", 
                "message": f"WebSocket error: {str(e)}"
            })
        except:
            pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)