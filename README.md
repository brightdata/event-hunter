# 🎯 Event Hunter AI

<div align="center">
  <img src="event-hunter/src/assets/brightdata.svg" alt="Event Hunter AI" width="200"/>
  <p><em>AI-powered event discovery service that finds industry conferences, hackathons, and networking opportunities</em></p>
  
  [![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/downloads/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.116+-green.svg)](https://fastapi.tiangolo.com/)
  [![React](https://img.shields.io/badge/React-19.1+-61DAFB.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue.svg)](https://www.typescriptlang.org/)
</div>

## 🌟 Overview

Event Hunter AI is a sophisticated multi-agent system that leverages AI to discover and analyze industry events. It combines the power of deep agents, web scraping capabilities through BrightData's MCP (Model Context Protocol), and an elegant React frontend to deliver comprehensive event intelligence.

### 🎯 What It Does

- **Smart Event Discovery**: Uses AI agents to search for conferences, hackathons, workshops, and industry events
- **Comprehensive Analysis**: Extracts detailed information including dates, locations, CFP status, and sponsorship opportunities  
- **Multi-Agent Architecture**: Employs specialized sub-agents for search and detailed analysis
- **Real-time Streaming**: WebSocket-based interface for live updates during processing
- **Modern UI**: Clean, responsive React interface with form-based query building

## 🏗️ Architecture

### Backend (Python + FastAPI)
The system uses a **multi-agent architecture** powered by the `deepagents` framework:

1. **Main Event Hunter Agent**: Orchestrates the entire process
2. **Event Search Sub-Agent**: Specialized in finding events using web search
3. **Event Details Sub-Agent**: Extracts comprehensive information from event pages

**Key Technologies:**
- **DeepAgents**: Multi-agent orchestration framework
- **BrightData MCP**: Web scraping and search engine access
- **LangChain**: LLM integration and prompt management
- **FastAPI**: Modern Python web framework with WebSocket support
- **Azure OpenAI**: GPT-4.1-mini for intelligent processing

### Frontend (React + TypeScript)
Modern, form-driven interface built with:
- **React 19.1** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations  
- **Radix UI** components
- **React Markdown** for formatted results

## 🚀 Features

### 🔍 Intelligent Event Search
- Multi-criteria search (industry, location, timeframe)
- Company-specific event discovery
- Advanced filtering and requirements

### 📊 Comprehensive Event Analysis
For each event discovered, the system extracts:
- **Event Name** and official link
- **Date & Time** information
- **Location** (city, venue, online/hybrid)
- **Main Statement** and description
- **CFP Status** (Call for Papers availability)
- **Sponsorship Opportunities**

### 🎨 Modern User Interface
- **Form-based Query Builder**: Intuitive event search criteria input
- **Real-time Streaming**: Live updates during AI processing
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark/Light Mode** support
- **Connection Status** indicators

### 🔄 Real-time Processing
- **WebSocket Streaming**: Live updates during search and analysis
- **Processing Timeline**: Transparent view of AI decision-making
- **Error Handling**: Graceful failure management and retry logic

## 📋 Prerequisites

Before setting up Event Hunter AI, you'll need:

### Required APIs
1. **BrightData Account**: For MCP web scraping capabilities
   - Sign up at [BrightData](https://brightdata.com)
   - Get your MCP token from the dashboard

2. **Azure OpenAI Access**: For GPT-4.1-mini model
   - Azure subscription with OpenAI service
   - API key and endpoint URL

### Development Environment
- **Python 3.8+** 
- **Node.js 18+** and **npm/yarn**
- **Git** for version control

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/brightdata/event-hunter.git
cd event-hunter
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
pip install -r requirements.txt
```

#### Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# BrightData MCP Configuration
BRIGHTDATA_API_TOKEN=your_brightdata_api_token_here

# Azure OpenAI Configuration  
OPENAI_API_KEY=your_azure_openai_api_key
OPENAI_BASE_URL=https://your-resource.openai.azure.com/openai/v1/
```

#### Start the Backend Server
```bash
python main.py
```

The API server will start on `http://localhost:8000`

### 3. Frontend Setup

#### Navigate to Frontend Directory
```bash
cd event-hunter
```

#### Install Dependencies
```bash
npm install
```

#### Start Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📖 Usage Guide

### Using the Web Interface

1. **Open the Application**: Navigate to `http://localhost:5173`

2. **Fill the Search Form**:
   - **Location**: Enter city, country, or "Online" for virtual events
   - **Date Range**: Select start and end dates for event search
   - **Industry Vertical**: Choose from predefined categories (AI, Fintech, etc.)
   - **Companies** (Optional): Specify companies of interest
   - **Additional Requirements** (Optional): Add specific criteria

3. **Submit Query**: Click "Find Events" to start the AI-powered search

4. **View Results**: Watch real-time processing and receive comprehensive event listings

### Using the API Directly

#### REST Endpoint
```bash
curl -X POST "http://localhost:8000/query" \
  -H "Content-Type: application/json" \
  -d '{"query": "Find AI hackathons in San Francisco for Q1 2025"}'
```

#### WebSocket Connection
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/query');
ws.send(JSON.stringify({
  query: "Find blockchain conferences in Europe for 2025"
}));
```

## 🛠️ Development

### Project Structure
```
event-hunter/
├── main.py                 # FastAPI backend server
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore rules
└── event-hunter/         # React frontend
    ├── src/
    │   ├── EventDiscoveryForm.tsx  # Main component
    │   ├── main.tsx               # App entry point
    │   ├── components/ui/         # UI components
    │   └── assets/               # Static assets
    ├── package.json              # Frontend dependencies
    └── vite.config.ts           # Vite configuration
```

### Backend Development

The backend uses a sophisticated multi-agent architecture:

```python
# Agent hierarchy
Main Event Hunter Agent
├── Event Search Sub-Agent    # Finds events using search engines
└── Event Details Sub-Agent   # Extracts detailed event information
```

**Key Components:**
- **Agent Initialization**: Sets up MCP tools and LLM connections
- **WebSocket Handler**: Manages real-time communication
- **Streaming Response**: Provides live updates during processing
- **Error Handling**: Graceful failure management

### Frontend Development

**Key Features:**
- **Form Validation**: Real-time input validation
- **WebSocket Integration**: Live streaming of AI responses  
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG-compliant UI components

#### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production  
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `BRIGHTDATA_API_TOKEN` | BrightData API access token | Yes |
| `OPENAI_API_KEY` | Azure OpenAI API key | Yes |
| `OPENAI_BASE_URL` | Azure OpenAI endpoint URL | Yes |

### Model Configuration

The system uses **GPT-4.1-mini** via Azure OpenAI. You can modify the model in `main.py`:

```python
model = init_chat_model(
    model="gpt-4.1-mini",        # Change model here
    model_provider="openai",
    api_key=openai_api_key,
    base_url=openai_base_url,
    default_query={"api-version": "preview"}
)
```

## 🔍 API Reference

### REST Endpoints

#### `GET /`
Health check endpoint

#### `GET /health`  
Detailed health status including agent readiness

#### `POST /query`
Synchronous event query processing

**Request Body:**
```json
{
  "query": "Find AI conferences in NYC for 2025"
}
```

**Response:**
```json
{
  "query": "Find AI conferences in NYC for 2025",
  "response": "**Event Name**: AI Summit NYC...",
  "status": "completed"
}
```

### WebSocket Endpoint

#### `WS /ws/query`
Real-time streaming event queries

**Message Types:**
- `start`: Query processing initiated
- `stream`: Incremental response content  
- `complete`: Processing finished
- `error`: Error occurred

## 🐛 Troubleshooting

### Common Issues

#### Backend Issues

**"Agent not initialized"**
- Check your API keys in `.env`
- Verify BrightData MCP token is valid
- Ensure Azure OpenAI endpoint is accessible

**Connection timeouts**
- Check network connectivity
- Verify firewall settings allow outbound HTTPS
- Confirm API rate limits aren't exceeded

#### Frontend Issues

**WebSocket connection failed**
- Ensure backend is running on port 8000
- Check CORS configuration
- Verify no proxy/firewall blocking WebSocket connections

**Build failures**
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
- Verify all dependencies are correctly installed

### Debug Mode

Enable detailed logging in the backend:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- **Code Style**: Follow PEP 8 for Python, ESLint rules for TypeScript
- **Testing**: Add tests for new features
- **Documentation**: Update README and code comments
- **Security**: Never commit API keys or sensitive data

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[BrightData](https://brightdata.com)** for providing MCP web scraping capabilities
- **[DeepAgents](https://github.com/langchain-ai/deepagents)** for the multi-agent framework
- **[LangChain](https://langchain.com)** for LLM orchestration
- **[FastAPI](https://fastapi.tiangolo.com/)** for the robust backend framework
- **[React](https://reactjs.org/)** and **[Tailwind CSS](https://tailwindcss.com/)** for the modern frontend

## 📞 Support

For support and questions:

- **Issues**: [GitHub Issues](https://github.com/brightdata/event-hunter/issues)
- **Documentation**: This README and inline code comments
- **Community**: Join discussions in the repository

---

<div align="center">
  <p><strong>Built with ❤️ using BrightData MCP, DeepAgents, and modern web technologies</strong></p>
</div>
