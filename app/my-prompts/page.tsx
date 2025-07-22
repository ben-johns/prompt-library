"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FileText, Pencil, Star, Trash2 } from "lucide-react"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Prompt } from "@/lib/database"

type PromptWithSavedAt = Prompt & { saved_at?: string }

export default function MyPromptsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [selectedPrompt, setSelectedPrompt] = useState<PromptWithSavedAt | null>(null)
  const [savedPrompts, setSavedPrompts] = useState<PromptWithSavedAt[]>([])
  const [createdPrompts, setCreatedPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)

  // Redirect to sign in if not authenticated
  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    router.push("/api/auth/signin")
    return null
  }

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const [savedResponse, createdResponse] = await Promise.all([
          fetch('/api/prompts/saved'),
          fetch('/api/prompts/my')
        ])

        if (savedResponse.ok) {
          const saved = await savedResponse.json()
          setSavedPrompts(saved)
        }

        if (createdResponse.ok) {
          const created = await createdResponse.json()
          setCreatedPrompts(created)
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
  }, [toast])

  const handleDelete = async (id: number, type: 'saved' | 'created') => {
    try {
      if (type === 'saved') {
        const response = await fetch(`/api/prompts/${id}/save`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
          const prompt = savedPrompts.find(p => p.id === id)
          setSavedPrompts(prev => prev.filter(p => p.id !== id))
          toast({
            title: "💔 Prompt unsaved",
            description: `"${prompt?.title}" has been removed from your saved collection.`,
            duration: 4000,
          })
        }
      } else {
        const response = await fetch(`/api/prompts/${id}`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
          const prompt = createdPrompts.find(p => p.id === id)
          setCreatedPrompts(prev => prev.filter(p => p.id !== id))
          toast({
            title: "🗑️ Prompt deleted",
            description: `"${prompt?.title}" has been permanently deleted from your submissions.`,
            duration: 4000,
          })
        }
      }
    } catch (error) {
      console.error('Error deleting prompt:', error)
      toast({
        title: "❌ Error",
        description: "Failed to delete prompt. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10">
            <Star className="mr-1 h-3 w-3" />
            Approved
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-700/10">
            Rejected
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-700/10">
            Pending Review
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container px-4 py-12 md:px-6">
          <div className="text-center">Loading your prompts...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container px-4 py-12 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Prompts</h1>
        <p className="mt-2 text-muted-foreground">Manage your saved and created prompts.</p>
      </div>

      <Tabs defaultValue="saved" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="saved">Saved Prompts</TabsTrigger>
          <TabsTrigger value="created">My Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="saved" className="space-y-6">
          {savedPrompts.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No saved prompts</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You haven't saved any prompts yet. Browse the library to find useful prompts.
              </p>
              <Button asChild className="mt-4">
                <Link href="/">Browse Prompts</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {savedPrompts.map((prompt) => (
                <Card key={prompt.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{prompt.title}</CardTitle>
                        <CardDescription className="mt-1">{prompt.description}</CardDescription>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(prompt.id, "saved")}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
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
                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                          onClick={() => setSelectedPrompt(prompt)}
                        >
                          View Prompt
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[625px]">
                        <DialogHeader>
                          <DialogTitle>{selectedPrompt?.title}</DialogTitle>
                          <DialogDescription>{selectedPrompt?.description}</DialogDescription>
                        </DialogHeader>
                        <Textarea className="min-h-[300px] font-mono text-sm" value={selectedPrompt?.prompt} readOnly />
                        <DialogFooter className="flex flex-col sm:flex-row gap-2">
                          <Button variant="outline" className="sm:w-1/2 bg-transparent">
                            Edit
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
          )}
        </TabsContent>

        <TabsContent value="created" className="space-y-6">
          {createdPrompts.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Pencil className="mx-auto h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No submitted prompts</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You haven't submitted any prompts yet. Create and share your own prompts with the community.
              </p>
              <Button asChild className="mt-4">
                <Link href="/submit">Submit a Prompt</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {createdPrompts.map((prompt) => (
                <Card key={prompt.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{prompt.title}</CardTitle>
                        <CardDescription className="mt-1">{prompt.description}</CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/submit?edit=${prompt.id}`}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(prompt.id, "created")}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {prompt.department}
                      </span>
                      <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                        {prompt.category}
                      </span>
                    </div>
                    <div>
                      {getStatusBadge(prompt.status)}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                          onClick={() => setSelectedPrompt(prompt)}
                        >
                          View Prompt
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[625px]">
                        <DialogHeader>
                          <DialogTitle>{selectedPrompt?.title}</DialogTitle>
                          <DialogDescription>{selectedPrompt?.description}</DialogDescription>
                        </DialogHeader>
                        <Textarea className="min-h-[300px] font-mono text-sm" value={selectedPrompt?.prompt} readOnly />
                        <DialogFooter className="flex flex-col sm:flex-row gap-2">
                          <Button variant="outline" className="sm:w-1/2 bg-transparent" asChild>
                            <Link href={`/submit?edit=${selectedPrompt?.id}`}>Edit Submission</Link>
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
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
