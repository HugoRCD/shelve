import { defineCommand } from 'citty'
import { consola } from 'consola'
import { deleteProjectConfig } from '../utils/projects'

export default defineCommand({
  meta: {
    name: 'unlink',
    description: 'unlink current project to a remote project',
  },
  setup() {
    consola.start('Unlinking project...')
    deleteProjectConfig()
    consola.success('Project unlinked successfully')
  },
})
