import { defineCollection, z } from '@nuxt/content'
import { asSeoCollection } from '@nuxtjs/seo/content'

export const collections = {
  content: defineCollection(
    asSeoCollection({
      type: 'page',
      source: '**/*',
      schema: z.object({
        navigation: z.object({
          title: z.string().optional(),
        }),
        links: z.array(z.object({
          label: z.string(),
          icon: z.string(),
          avatar: z.object({
            src: z.string(),
            alt: z.string()
          }).optional(),
          to: z.string(),
          target: z.string().optional()
        }))
      })
    })
  ),
  about: defineCollection({
    type: 'data',
    source: 'about.yml',
    schema: z.object({
      about: z.array(z.object({
        title: z.string(),
        image: z.string(),
        content: z.string()
      }))
    })
  })
}
