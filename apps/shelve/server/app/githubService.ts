import { H3Event } from 'h3'

export async function getUserRepos(event: H3Event) {
  const { user, secure } = await getUserSession(event)
  const { githubToken } = secure

  const repos = await $fetch('https://api.github.com/user/repos?per_page=100', {
    headers: {
      Authorization: `token ${githubToken}`,
    },
  })
  console.log(`Found ${repos.length} repositories for user ${user.username}`)
  console.log(repos.map(repo => {
    return {
      name: repo.name,
      owner: repo.owner.login,
    }
  }))

  return repos
}

export async function uploadFile(event: H3Event, file: File, repoName: string) {
  const { user, secure } = await getUserSession(event)
  const { githubToken } = secure

  const fileContent = await file.arrayBuffer()
  const content = Buffer.from(fileContent).toString('base64')

  return await $fetch(`https://api.github.com/repos/${ user.username }/${ repoName }/contents/${ file.name }`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${ githubToken }`,
    },
    body: {
      message: 'push from shelve',
      content: content,
      branch: 'master'
    }
  })
}
