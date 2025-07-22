import { notFound } from "next/navigation"
import Header from "@/components/header"
import PromptGrid from "@/components/prompt-grid"

const departmentNames: Record<string, string> = {
  "project-management": "Project Management",
  "marketing": "Marketing",
  "sales": "Sales",
  "engineering": "Engineering",
  "hr": "Human Resources",
  "finance": "Finance",
  "design": "Design",
  "customer-support": "Customer Support",
  "executive": "Executive",
  "operations": "Operations",
}

export default function DepartmentPage({ params }: { params: { slug: string } }) {
  const departmentName = departmentNames[params.slug]
  
  if (!departmentName) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container px-4 py-12 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{departmentName} Prompts</h1>
          <p className="mt-2 text-muted-foreground">
            Discover prompts specifically curated for {departmentName.toLowerCase()} professionals.
          </p>
        </div>
        <PromptGrid department={params.slug} />
      </div>
    </div>
  )
}

export function generateStaticParams() {
  return Object.keys(departmentNames).map((slug) => ({
    slug,
  }))
} 