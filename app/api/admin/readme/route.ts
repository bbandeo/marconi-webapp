import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

interface Section {
  title: string
  id: string
  icon: string
  level: number
}

interface ApiEndpoint {
  method: string
  path: string
  description: string
}

export async function GET() {
  try {
    // Read the ANALYTICS.md file
    const readmePath = path.join(process.cwd(), 'ANALYTICS.md')
    const content = await fs.readFile(readmePath, 'utf8')

    // Parse sections from the markdown content
    const sections = parseMarkdownSections(content)
    
    // Extract API endpoints from the content
    const endpoints = extractApiEndpoints(content)

    return NextResponse.json({
      content,
      sections,
      endpoints,
      lastUpdated: new Date().toISOString(),
      commitHash: 'af7af7de771b44aa0696ac651bada12d20fc9e84'
    })
  } catch (error) {
    console.error('Error reading README:', error)
    
    // Return fallback data if file reading fails
    return NextResponse.json({
      content: '# Error: No se pudo cargar el contenido del README',
      sections: [],
      endpoints: [],
      error: 'Failed to load README content'
    }, { status: 500 })
  }
}

function parseMarkdownSections(content: string): Section[] {
  const lines = content.split('\n')
  const sections: Section[] = []
  
  for (const line of lines) {
    if (line.startsWith('## ')) {
      const title = line.replace('## ', '').replace(/^[🚀📊🛠️🛡️🚀🔧🔍📚🎯📞📄]+ /, '')
      const id = title.toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '-')
      
      // Assign appropriate icons based on section content
      let icon = 'FileText'
      if (title.includes('Quick Start') || title.includes('Start')) icon = 'ArrowRight'
      else if (title.includes('API') || title.includes('Endpoints')) icon = 'Terminal'
      else if (title.includes('Security') || title.includes('Privacy') || title.includes('GDPR')) icon = 'Shield'
      else if (title.includes('Analytics') || title.includes('Dashboard') || title.includes('Metrics')) icon = 'BarChart3'
      else if (title.includes('Database') || title.includes('Schema')) icon = 'Database'
      else if (title.includes('Configuration') || title.includes('Setup')) icon = 'Settings'
      else if (title.includes('Performance') || title.includes('Optimization')) icon = 'BarChart3'
      else if (title.includes('Property') || title.includes('Properties')) icon = 'Home'
      else if (title.includes('Lead') || title.includes('Attribution')) icon = 'BarChart3'
      
      sections.push({
        title,
        id,
        icon,
        level: 1
      })
    } else if (line.startsWith('### ')) {
      const title = line.replace('### ', '').replace(/^[🚀📊🛠️🛡️🚀🔧🔍📚🎯📞📄]+ /, '')
      const id = title.toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '-')
      
      let icon = 'ChevronRight'
      if (title.includes('Session')) icon = 'Settings'
      else if (title.includes('Property')) icon = 'Home'
      else if (title.includes('Lead')) icon = 'BarChart3'
      else if (title.includes('GDPR') || title.includes('Privacy')) icon = 'Shield'
      
      sections.push({
        title,
        id,
        icon,
        level: 2
      })
    }
  }
  
  return sections
}

function extractApiEndpoints(content: string): ApiEndpoint[] {
  const endpoints: ApiEndpoint[] = []
  const lines = content.split('\n')
  
  for (const line of lines) {
    // Look for HTTP method patterns in markdown
    const httpMethodRegex = /(GET|POST|PUT|DELETE|PATCH)\s+([/\w\-\[\]:?={}]+)/g
    let match
    
    while ((match = httpMethodRegex.exec(line)) !== null) {
      const method = match[1]
      const path = match[2]
      let description = line.replace(match[0], '').replace(/[#`]/g, '').trim()
      
      // Clean up description
      if (description.startsWith('- ')) description = description.substring(2)
      if (!description) {
        // Try to get description from context
        if (path.includes('session')) description = 'Session management'
        else if (path.includes('property-view')) description = 'Property view tracking'
        else if (path.includes('lead-generation')) description = 'Lead generation tracking'
        else if (path.includes('dashboard')) description = 'Analytics dashboard data'
        else if (path.includes('gdpr')) description = 'GDPR compliance'
        else if (path.includes('property-metrics')) description = 'Property metrics'
        else description = 'API endpoint'
      }
      
      endpoints.push({
        method,
        path,
        description
      })
    }
  }
  
  return endpoints
}