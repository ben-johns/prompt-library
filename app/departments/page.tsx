"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  BarChart2,
  Briefcase,
  Building2,
  Code,
  CreditCard,
  Headphones,
  LineChart,
  PenTool,
  Target,
  Users,
} from "lucide-react"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface DepartmentInfo {
  id: string
  name: string
  count: number
}

const departmentConfig = [
  {
    id: "project-management",
    name: "Project Management",
    description: "Prompts for planning, tracking, and delivering successful projects",
    icon: <Target className="h-12 w-12 text-violet-500" />,
  },
  {
    id: "marketing",
    name: "Marketing",
    description: "Prompts for content creation, campaign planning, and market analysis",
    icon: <LineChart className="h-12 w-12 text-blue-500" />,
  },
  {
    id: "sales",
    name: "Sales",
    description: "Prompts for outreach, follow-ups, proposals, and closing deals",
    icon: <BarChart2 className="h-12 w-12 text-green-500" />,
  },
  {
    id: "engineering",
    name: "Engineering",
    description: "Prompts for code documentation, technical specifications, and problem-solving",
    icon: <Code className="h-12 w-12 text-red-500" />,
  },
  {
    id: "hr",
    name: "Human Resources",
    description: "Prompts for job descriptions, performance reviews, and employee communications",
    icon: <Users className="h-12 w-12 text-amber-500" />,
  },
  {
    id: "finance",
    name: "Finance",
    description: "Prompts for financial reporting, budget planning, and analysis",
    icon: <CreditCard className="h-12 w-12 text-emerald-500" />,
  },
  {
    id: "design",
    name: "Design",
    description: "Prompts for design briefs, feedback, and creative direction",
    icon: <PenTool className="h-12 w-12 text-pink-500" />,
  },
  {
    id: "customer-support",
    name: "Customer Support",
    description: "Prompts for customer communications, troubleshooting, and satisfaction surveys",
    icon: <Headphones className="h-12 w-12 text-cyan-500" />,
  },
  {
    id: "executive",
    name: "Executive",
    description: "Prompts for strategic planning, board communications, and leadership",
    icon: <Briefcase className="h-12 w-12 text-indigo-500" />,
  },
  {
    id: "operations",
    name: "Operations",
    description: "Prompts for process improvement, logistics, and operational efficiency",
    icon: <Building2 className="h-12 w-12 text-orange-500" />,
  },
]

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<DepartmentInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/departments')
        if (response.ok) {
          const data = await response.json()
          setDepartments(data)
        }
      } catch (error) {
        console.error('Error fetching departments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDepartments()
  }, [])

  const getDepartmentConfig = (id: string) => {
    return departmentConfig.find(config => config.id === id)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container px-4 py-12 md:px-6">
          <div className="text-center">Loading departments...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container px-4 py-12 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Browse by Department</h1>
        <p className="mt-2 text-muted-foreground">
          Find prompts tailored to your specific professional role and needs.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((department) => {
          const config = getDepartmentConfig(department.id)
          return (
            <Card key={department.id}>
              <CardHeader>
                <div className="mb-2">{config?.icon}</div>
                <CardTitle>{config?.name || department.name}</CardTitle>
                <CardDescription>{config?.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {department.count} prompt{department.count !== 1 ? 's' : ''} available
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/departments/${department.id}`}>View Prompts</Link>
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
      </div>
    </div>
  )
}
