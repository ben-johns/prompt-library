"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import PromptGrid from "@/components/prompt-grid"
import Header from "@/components/header"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function Home() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value === "all" ? "" : value)
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === "all" ? "" : value)
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-12 md:px-6 md:py-16 lg:py-20 max-w-7xl">
        {/* Hero Section */}
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Prompt Library
          </h1>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl lg:text-2xl">
            Discover optimized prompts tailored for your professional role and department.
          </p>
        </div>

        {/* Search and Filters Section */}
        <div className="mx-auto mt-12 max-w-2xl md:mt-16">
          <div className="flex flex-col gap-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search prompts..." 
                className="pl-11 h-12 text-base" 
              />
            </div>
            
            {/* Filter Dropdowns */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select value={selectedDepartment || "all"} onValueChange={handleDepartmentChange}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
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
              <Select value={selectedCategory || "all"} onValueChange={handleCategoryChange}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
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
        </div>

        {/* Prompts Grid */}
        <div className="mx-auto mt-16 max-w-6xl">
          <PromptGrid 
            department={selectedDepartment || undefined} 
            category={selectedCategory || undefined} 
          />
        </div>
      </main>
    </div>
  )
}
