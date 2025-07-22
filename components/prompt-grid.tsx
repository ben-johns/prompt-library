"use client"

import { DialogFooter } from "@/components/ui/dialog"
import React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import {
  BarChart2,
  Calendar,
  FileText,
  Mail,
  MessageSquare,
  PenTool,
  PieChart,
  Table,
  Target,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Prompt } from "@/lib/database"

interface PromptGridProps {
  department?: string
  category?: string
}

const iconMap: Record<string, React.ReactElement> = {
  documentation: <FileText className="h-8 w-8 text-emerald-500" />,
  reporting: <Target className="h-8 w-8 text-violet-500" />,
  email: <Mail className="h-8 w-8 text-blue-500" />,
  planning: <BarChart2 className="h-8 w-8 text-red-500" />,
  communication: <Users className="h-8 w-8 text-amber-500" />,
  analysis: <PieChart className="h-8 w-8 text-pink-500" />,
  "team-management": <Table className="h-8 w-8 text-indigo-500" />,
}

export default function PromptGrid({ department, category }: PromptGridProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [savedPrompts, setSavedPrompts] = useState<Set<number>>(new Set())

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const url = new URL('/api/prompts', window.location.origin)
        if (department) {
          url.searchParams.set('department', department)
        }
        if (category) {
          url.searchParams.set('category', category)
        }
        
        const response = await fetch(url.toString())
        if (response.ok) {
          const data = await response.json()
          setPrompts(data)
        }
      } catch (error) {
        console.error('Error fetching prompts:', error)
        toast({
          title: "Error",
          description: "Failed to fetch prompts. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPrompts()
  }, [department, category, toast])

  useEffect(() => {
    // Fetch user's saved prompts to show saved state
    const fetchSavedPrompts = async () => {
      if (!session) return
      
      try {
        const response = await fetch('/api/prompts/saved')
        if (response.ok) {
          const saved: Prompt[] = await response.json()
          const savedIds = new Set<number>(saved.map(p => p.id))
          setSavedPrompts(savedIds)
        }
      } catch (error) {
        console.error('Error fetching saved prompts:', error)
      }
    }

    fetchSavedPrompts()
  }, [session])

  const handleSavePrompt = async (promptId: number) => {
    if (!session) {
      toast({
        title: "🔒 Authentication required",
        description: "Please sign in to save prompts.",
        variant: "destructive",
      })
      return
    }

    try {
      const isSaved = savedPrompts.has(promptId)
      const method = isSaved ? 'DELETE' : 'POST'
      
      const response = await fetch(`/api/prompts/${promptId}/save`, {
        method,
      })

      if (response.ok) {
        setSavedPrompts(prev => {
          const newSet = new Set(prev)
          if (isSaved) {
            newSet.delete(promptId)
          } else {
            newSet.add(promptId)
          }
          return newSet
        })
        
        // Find the prompt title for the toast
        const prompt = prompts.find(p => p.id === promptId)
        const promptTitle = prompt?.title || 'Prompt'
        
        toast({
          title: isSaved ? "💔 Prompt unsaved" : "💾 Prompt saved!",
          description: isSaved 
            ? `"${promptTitle}" has been removed from your saved collection.`
            : `"${promptTitle}" has been added to your saved collection. Find it in "My Prompts".`,
          duration: 4000,
        })
      } else {
        const error = await response.json()
        toast({
          title: "❌ Error",
          description: error.error || "Failed to save prompt. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error saving prompt:', error)
      toast({
        title: "❌ Error",
        description: "Failed to save prompt. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="mt-12 text-center">Loading prompts...</div>
  }

  if (prompts.length === 0) {
    return (
      <div className="mt-12 text-center">
        <h3 className="text-lg font-medium">No prompts found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {department 
            ? `No approved prompts available for ${department} yet.`
            : "No approved prompts available yet."
          }
        </p>
      </div>
    )
  }

  return (
    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {prompts.map((prompt) => (
        <Card key={prompt.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="mb-2">
              {iconMap[prompt.category] || <FileText className="h-8 w-8 text-gray-500" />}
            </div>
            <CardTitle>{prompt.title}</CardTitle>
            <CardDescription>{prompt.description}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                {prompt.department}
              </span>
              <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                {prompt.category}
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full bg-transparent" onClick={() => setSelectedPrompt(prompt)}>
                  View Prompt
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>{selectedPrompt?.title}</DialogTitle>
                  <DialogDescription>{selectedPrompt?.description}</DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="prompt">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="prompt">Prompt</TabsTrigger>
                    <TabsTrigger value="use">How to Use</TabsTrigger>
                  </TabsList>
                  <TabsContent value="prompt" className="space-y-4">
                    <Textarea className="min-h-[300px] font-mono text-sm" value={selectedPrompt?.prompt} readOnly />
                    <div className="flex gap-2">
                      <Button
                        className="w-1/2"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedPrompt?.prompt || "")
                          toast({
                            title: "📋 Copied to clipboard!",
                            description: `"${selectedPrompt?.title}" is ready to use in your AI assistant.`,
                            duration: 3000,
                          })
                        }}
                      >
                        Copy to Clipboard
                      </Button>
                      <Button
                        className="w-1/2"
                        onClick={() => {
                          // Create the Gemini URL with the prompt text encoded as a parameter
                          const encodedPrompt = encodeURIComponent(selectedPrompt?.prompt || "")
                          // Open Gemini in a new tab with the prompt
                          window.open(`https://gemini.google.com/app?text=${encodedPrompt}`, "_blank")
                        }}
                      >
                        Use in Gemini
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="use" className="space-y-4">
                    <div className="space-y-4 text-sm">
                      <h3 className="font-medium">Instructions:</h3>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Copy the prompt text above</li>
                        <li>Paste it into your AI assistant of choice</li>
                        <li>Replace the placeholder text in [BRACKETS] with your specific information</li>
                        <li>Submit the prompt to get your customized response</li>
                      </ol>
                      <h3 className="font-medium mt-4">Tips:</h3>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Be specific when replacing placeholder text</li>
                        <li>Add additional context if needed</li>
                        <li>You can modify sections of the prompt to better fit your needs</li>
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant="outline" 
                    className="sm:w-1/2 bg-transparent"
                    onClick={() => selectedPrompt && handleSavePrompt(selectedPrompt.id)}
                    disabled={!session}
                  >
                    {selectedPrompt && savedPrompts.has(selectedPrompt.id) ? 'Unsave' : 'Save to My Prompts'}
                  </Button>
                  <Button
                    className="sm:w-1/2"
                    onClick={() => {
                      // Create the Gemini URL with the prompt text encoded as a parameter
                      const encodedPrompt = encodeURIComponent(selectedPrompt?.prompt || "")
                      // Open Gemini in a new tab with the prompt
                      window.open(`https://gemini.google.com/app?text=${encodedPrompt}`, "_blank")
                    }}
                  >
                    Use in Gemini
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
