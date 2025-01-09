import { defineCollection, z } from '@nuxt/content'

export const collections = {
  content: defineCollection({
    type: 'page',
    source: '**/*.md',
    schema: z.object({
      title: z.string().nonempty(),
      description: z.string().nonempty(),
      date: z.string().nonempty(),
    })
  }),
}
