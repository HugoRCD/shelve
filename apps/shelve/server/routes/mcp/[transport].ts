import { createMcpHandler } from '@vercel/mcp-adapter'
import { z } from 'zod'

const handler = createMcpHandler(
  (server) => {
    server.tool(
      'get-user',
      'Get user information',
      {
        message: z.string().optional()
      },
      ({ message }) => {
        console.log('message', message)
        
        return {
          content: [{ type: 'text', text: `Tool echo: ${message}` }]
        }
      }
    )

    server.tool(
      'get-projects',
      'Get all projects for the user',
      {
        teamSlug: z.string({
          description: 'The slug of the team to get projects for'
        }).optional()
      },
      ({ teamSlug }) => {
        console.log('teamSlug', teamSlug)
        
        return {
          content: [{ type: 'text', text: `Projects for team: ${teamSlug || 'all teams'}` }]
        }
      }
    )
  },
  {
    capabilities: {
      tools: {
        'get-user': {
          description: 'Get user information'
        },
        'get-projects': {
          description: 'Get all projects for the user'
        }
      }
    }
  },
  {
    redisUrl: process.env.REDIS_URL,
    basePath: '/mcp',
    verboseLogs: true,
    maxDuration: 60
  }
)

export default fromWebHandler(handler)
