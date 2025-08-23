import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, Sparkles, MapPin, Calendar as CalendarIcon, Building, Target, Plus, Wifi, WifiOff } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import LogoSvg from './assets/brightdata.svg';
interface EventFormData {
  location: string
  dateRange: { from: Date | undefined; to?: Date | undefined } | undefined
  vertical: string
  companies: string
  additionalInfo: string
}

const verticalOptions = [
  'AI & Machine Learning',
  'Cybersecurity', 
  'Blockchain & Web3',
  'Fintech',
  'Healthcare Tech',
  'DevTools & Infrastructure',
  'SaaS & Enterprise',
  'Gaming & Entertainment',
  'EdTech',
  'Climate Tech',
  'Biotech',
  'Robotics & Hardware'
]

function EventDiscoveryForm() {
  const [formData, setFormData] = useState<EventFormData>({
    location: '',
    dateRange: undefined,
    vertical: '',
    companies: '',
    additionalInfo: ''
  })
  const [result, setResult] = useState<string>('')
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  
  const wsRef = useRef<WebSocket | null>(null)

  const connectWebSocket = () => {
    wsRef.current = new WebSocket('ws://localhost:8000/ws/query')
    
    wsRef.current.onopen = () => {
      setIsConnected(true)
      setError('')
    }
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === 'start') {
        setIsLoading(true)
        setResult('')
      } else if (data.type === 'stream') {
        // Only show clean final responses, filter out tool calls
        const isToolCallContent = data.content.includes('Tool Calls:') || 
                                data.content.includes('call_') ||
                                data.content.includes('===') ||
                                data.content.includes('Agent') ||
                                data.content.includes('Running')

        const isFinalResponse = data.content.includes('**Event Name**:') ||
                              data.content.includes('## ') ||
                              (data.content.length > 100 && !isToolCallContent)
        
        if (isFinalResponse) {
          setResult(data.content)
        }
      } else if (data.type === 'complete') {
        setIsLoading(false)
      } else if (data.type === 'error') {
        setIsLoading(false)
        setError(data.message || 'An error occurred')
      }
    }
    
    wsRef.current.onclose = () => {
      setIsConnected(false)
    }

    wsRef.current.onerror = () => {
      setError('Connection failed. Please check if the backend is running.')
      setIsConnected(false)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    connectWebSocket()
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected || isLoading) return
    
    // Build query from form data
    const dateRangeText = formData.dateRange?.from && formData.dateRange?.to
      ? `from ${format(formData.dateRange.from, 'MMMM d, yyyy')} to ${format(formData.dateRange.to, 'MMMM d, yyyy')}`
      : formData.dateRange?.from
      ? `starting from ${format(formData.dateRange.from, 'MMMM d, yyyy')}`
      : 'upcoming'

    const query = `Find ${formData.vertical} events in ${formData.location} ${dateRangeText}.${
      formData.companies ? ` Focus on events where these companies might be involved: ${formData.companies}.` : ''
    }${
      formData.additionalInfo ? ` Additional requirements: ${formData.additionalInfo}` : ''
    }`

    wsRef.current?.send(JSON.stringify({ query }))
  }

  const handleInputChange = (field: keyof EventFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Enhanced animated background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/30 to-pink-50/30 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30" />
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-r from-pink-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-2000" />
        
        {/* Mesh gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.1),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.1),transparent_50%)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
        <div className="flex items-center justify-center mb-6">
          <img 
            src={LogoSvg} 
            alt="Logo" 
            className="w-40 h-40" 
          />
        </div>

          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Event Hunter
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Find the perfect industry events tailored to your needs. Our AI will search and curate relevant conferences, hackathons, and networking opportunities.
          </p>

          
          <div className="flex items-center justify-center mt-4">
            <Badge className={cn(
              "text-sm px-3 py-1",
              isConnected 
                ? "bg-green-500 hover:bg-green-600" 
                : "bg-red-500 hover:bg-red-600"
            )}>
              {isConnected ? (
                <>
                  <Wifi className="w-3 h-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 mr-1" />
                  Disconnected
                </>
              )}
            </Badge>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-800/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Search className="w-4 h-4 text-white" />
                  </div>
                  Event Search Criteria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-base font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      placeholder="e.g., San Francisco, New York, Europe, Online"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="bg-white/50 dark:bg-slate-950/50"
                      required
                    />
                  </div>

                  {/* Date Range */}
                  <div className="space-y-2">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-purple-500" />
                      Event Date Range
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-white/50 dark:bg-slate-950/50",
                            !formData.dateRange && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.dateRange?.from ? (
                            formData.dateRange.to ? (
                              <>
                                {format(formData.dateRange.from, "LLL dd, y")} -{" "}
                                {format(formData.dateRange.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(formData.dateRange.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={formData.dateRange?.from}
                          selected={formData.dateRange}
                          onSelect={(range) => setFormData(prev => ({ ...prev, dateRange: range }))}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Vertical */}
                  <div className="space-y-2">
                    <Label htmlFor="vertical" className="text-base font-medium flex items-center gap-2">
                      <Target className="w-4 h-4 text-pink-500" />
                      Industry Vertical
                    </Label>
                    <Select value={formData.vertical} onValueChange={(value) => handleInputChange('vertical', value)}>
                      <SelectTrigger className="bg-white/50 dark:bg-slate-950/50">
                        <SelectValue placeholder="Select industry vertical" />
                      </SelectTrigger>
                      <SelectContent>
                        {verticalOptions.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Companies */}
                  <div className="space-y-2">
                    <Label htmlFor="companies" className="text-base font-medium flex items-center gap-2">
                      <Building className="w-4 h-4 text-green-500" />
                      Relevant Companies (Optional)
                    </Label>
                    <Input
                      id="companies"
                      placeholder="e.g., OpenAI, Microsoft, Google, Anthropic"
                      value={formData.companies}
                      onChange={(e) => handleInputChange('companies', e.target.value)}
                      className="bg-white/50 dark:bg-slate-950/50"
                    />
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-2">
                    <Label htmlFor="additionalInfo" className="text-base font-medium flex items-center gap-2">
                      <Plus className="w-4 h-4 text-orange-500" />
                      Additional Requirements (Optional)
                    </Label>
                    <Textarea
                      id="additionalInfo"
                      placeholder="e.g., Looking for events with CFP open, sponsorship opportunities, networking focus, etc."
                      value={formData.additionalInfo}
                      onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                      className="bg-white/50 dark:bg-slate-950/50 min-h-[80px]"
                    />
                  </div>

                  {/* Error Display */}
                  {error && (
                    <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
                      <AlertDescription className="text-red-700 dark:text-red-300">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Submit Button */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity" />
                    <Button 
                      type="submit" 
                      disabled={!isConnected || isLoading || !formData.location || !formData.dateRange?.from || !formData.vertical}
                      size="lg"
                      className="relative w-full px-8 py-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 rounded-2xl border-0 group-hover:scale-105"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          <span className="font-medium">Discovering Events...</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Search className="w-5 h-5 mr-2 group-hover:translate-x-0.5 transition-transform" />
                          <span className="font-medium">Find Events</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-800/20 shadow-xl">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="relative mb-6">
                          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                          <div className="absolute inset-0 bg-blue-600 blur-lg opacity-40 animate-pulse" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                          Discovering Events
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
                          Our AI is searching the web for the perfect events that match your criteria. This may take a moment...
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {result && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-800/20 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-2xl flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        Event Discovery Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none text-slate-900 dark:text-slate-100 dark:prose-invert">
                        <ReactMarkdown
                          components={{
                            h1: ({children}) => <h1 className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-100">{children}</h1>,
                            h2: ({children}) => <h2 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">{children}</h2>,
                            h3: ({children}) => <h3 className="text-base font-medium mb-2 text-slate-700 dark:text-slate-300">{children}</h3>,
                            p: ({children}) => <p className="mb-3 leading-relaxed text-slate-700 dark:text-slate-300">{children}</p>,
                            ul: ({children}) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                            ol: ({children}) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                            li: ({children}) => <li className="leading-relaxed text-slate-600 dark:text-slate-400">{children}</li>,
                            strong: ({children}) => <strong className="font-semibold text-blue-600 dark:text-blue-400">{children}</strong>,
                            a: ({href, children}) => (
                              <a 
                                href={href} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline decoration-dotted underline-offset-2 transition-colors"
                              >
                                {children}
                              </a>
                            ),
                            code: ({children}) => (
                              <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono text-slate-800 dark:text-slate-200">
                                {children}
                              </code>
                            )
                          }}
                        >
                          {result}
                        </ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {!result && !isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-800/20 shadow-xl">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center mb-6">
                          <Search className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                          Ready to Discover Events
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md">
                          Fill out the form on the left to start discovering amazing industry events tailored to your needs.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default EventDiscoveryForm