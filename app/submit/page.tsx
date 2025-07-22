"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function SubmitPrompt() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "",
    category: "",
    prompt: "",
  })

  // Redirect to sign in if not authenticated
  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    router.push("/api/auth/signin")
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        // Reset form
        setFormData({
          title: "",
          description: "",
          department: "",
          category: "",
          prompt: "",
        })
        
        // Show success dialog
        setShowSuccessDialog(true)
        
        // Also show toast
        toast({
          title: "✅ Prompt submitted successfully!",
          description: "Your prompt has been submitted for review and will appear in the library once approved.",
          duration: 5000,
        })
      } else {
        const error = await response.json()
        toast({
          title: "❌ Error",
          description: error.error || "Failed to submit prompt. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting prompt:", error)
      toast({
        title: "❌ Error",
        description: "Failed to submit prompt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false)
    router.push("/my-prompts")
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container px-4 py-12 md:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Submit a Prompt</h1>
          <p className="mt-2 text-muted-foreground">
            Share your effective prompts with the community to help others in similar roles.
          </p>
        </div>
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Prompt Details</CardTitle>
              <CardDescription>Fill out the form below to submit your prompt to the library.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Prompt Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="E.g., Project Status Report Template"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Short Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Briefly describe what this prompt helps with"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => handleSelectChange("department", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="project-management">Project Management</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="hr">Human Resources</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="customer-support">Customer Support</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange("category", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email templates</SelectItem>
                      <SelectItem value="documentation">Documentation</SelectItem>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="analysis">Analysis</SelectItem>
                      <SelectItem value="communication">Communication</SelectItem>
                      <SelectItem value="reporting">Reporting</SelectItem>
                      <SelectItem value="team-management">Team Management</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt Text</Label>
                <Textarea
                  id="prompt"
                  name="prompt"
                  placeholder="Paste your full prompt here. Include placeholders like [PROJECT NAME] for customizable parts."
                  className="min-h-[200px] font-mono text-sm"
                  value={formData.prompt}
                  onChange={handleChange}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:space-x-2 sm:space-y-0">
              <Button variant="outline" type="button" asChild>
                <Link href="/">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Prompt"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl">Prompt Submitted Successfully!</DialogTitle>
            <DialogDescription className="text-center">
              Your prompt "{formData.title || 'Untitled'}" has been submitted for review. 
              It will appear in the library once approved by our team.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 pt-4">
            <Button onClick={handleSuccessDialogClose} className="w-full">
              View My Prompts
            </Button>
            <Button variant="outline" onClick={() => setShowSuccessDialog(false)} className="w-full">
              Submit Another Prompt
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
