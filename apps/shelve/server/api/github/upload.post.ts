import type { H3Event } from 'h3'
import { GitHubService } from '~~/server/services/github.service'

export default defineEventHandler(async (event: H3Event) => {
  const formData = await readMultipartFormData(event)
  if (!formData) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No form data provided'
    })
  }

  const fileField = formData.find(field => field.name === 'file')
  if (!fileField || !fileField.filename) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No file provided'
    })
  }
  const gitHubService = new GitHubService()

  const file = new File([fileField.data], fileField.filename, { type: fileField.type })
  const repoName = 'astra'

  return await gitHubService.uploadFile(event, file, repoName)
})
