import { defineCollection, z } from '@nuxt/content'
import { asSeoCollection } from '@nuxtjs/seo/content'

export const collections = {
  docs: defineCollection(
    asSeoCollection({
      type: 'page',
      source: {
        include: 'docs/**/*',
        prefix: ''
      },
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
  blog: defineCollection(
    asSeoCollection({
      type: 'page',
      source: 'blog/**/*.md',
      schema: z.object({
        title: z.string().nonempty(),
        description: z.string().nonempty(),
        date: z.string(),
        image: z.string(),
        tags: z.array(z.string()),
        authors: z.array(z.object({
          name: z.string(),
          description: z.string(),
          to: z.string(),
          target: z.string(),
          avatar: z.object({
            src: z.string(),
            alt: z.string()
          }).optional()
        })),
      })
    })
  ),
  blogPage: defineCollection({
    type: 'data',
    source: 'blog.yml',
    schema: z.object({
      title: z.string().nonempty(),
      description: z.string().nonempty()
    })
  }),
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
  }),
  index: defineCollection({
    type: 'data',
    source: 'index.yml',
    schema: z.object({
      title: z.string().nonempty(),
      description: z.string().nonempty(),
      cta: z.string().nonempty(),
      features: z.object({
        title: z.string(),
        description: z.string(),
        features: z.array(z.object({
          title: z.string().nonempty(),
          description: z.string().nonempty(),
          icon: z.string().nonempty(),
          soon: z.boolean().optional()
        }))
      }),
      faq: z.object({
        title: z.string().nonempty(),
        description: z.string().nonempty(),
        cta: z.object({
          label: z.string().nonempty(),
          to: z.string().nonempty()
        }),
        items: z.array(z.object({
          label: z.string().nonempty(),
          defaultOpen: z.boolean().optional(),
          content: z.string().nonempty()
        }))
      })
    })
  }),
  brand: defineCollection({
    type: 'data',
    source: 'brand.yml',
    schema: z.object({
      title: z.string().nonempty(),
      description: z.string().nonempty(),
      logo: z.object({
        description: z.string().nonempty(),
        icons: z.array(z.object({
          name: z.string(),
          color: z.string(),
          icon: z.string()
        })),
        logos: z.array(z.object({
          name: z.string(),
          color: z.string(),
          icon: z.string()
        })),
      }),
      colorPalette: z.object({
        description: z.string(),
        colors: z.array(z.object({
          name: z.string(),
          value: z.string()
        }))
      })
    })
  })
}
