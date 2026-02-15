import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import { defineDocusCollections } from 'docus/collections'

const buttonSchema = z.object({
  label: z.string(),
  icon: z.string(),
  trailingIcon: z.string(),
  to: z.string(),
  color: z.enum(['primary', 'neutral']).optional(),
  size: z.enum(['sm', 'md', 'lg', 'xl']).optional(),
  variant: z.enum(['solid', 'outline', 'subtle', 'link']).optional(),
  id: z.string().optional(),
  target: z.enum(['_blank', '_self']).optional()
})

const pageFeatureSchema = z.object({
  title: z.string(),
  description: z.string(),
  icon: z.string().editor({ input: 'icon' }),
  to: z.string().optional(),
  target: z.enum(['_blank', '_self']).optional(),
  soon: z.boolean().optional()
})

const pageSectionSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string(),
  links: z.array(buttonSchema),
  features: z.array(pageFeatureSchema),
  image: z.object({
    light: z.string().editor({ input: 'media' }),
    dark: z.string().editor({ input: 'media' }),
    width: z.number().optional(),
    height: z.number().optional()
  })
})

const pageHeroSchema = z.object({
  title: z.string(),
  description: z.string(),
  image: z.object({
    width: z.number().optional(),
    height: z.number().optional(),
    light: z.string().editor({ input: 'media' }),
    dark: z.string().editor({ input: 'media' })
  }).optional(),
  headline: z.object({
    label: z.string(),
    to: z.string(),
    icon: z.string().optional().editor({ input: 'icon' })
  }).optional(),
  links: z.array(buttonSchema).optional()
})

export default defineContentConfig({
  collections: {
    ...defineDocusCollections({ basePath: '/docs', contentDir: 'docs', landing: false }),
    blog: defineCollection({
      type: 'page',
      source: 'blog/**/*.md',
      schema: z.object({
        title: z.string().nonempty(),
        description: z.string().nonempty(),
        date: z.string(),
        minRead: z.number(),
        image: z.string(),
        tags: z.array(z.string()),
        word: z.string(),
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
    }),
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
        hero: pageHeroSchema,
        sections: z.array(pageSectionSchema),
        features: pageSectionSchema,
        faq: pageSectionSchema.extend({
          items: z.array(z.object({
            label: z.string().nonempty(),
            defaultOpen: z.boolean().optional(),
            content: z.string().nonempty()
          }))
        }),
        cta: pageSectionSchema.extend({
          dynamicTitle: z.object({
            morning: z.string(),
            afternoon: z.string(),
            evening: z.string(),
            default: z.string()
          })
        })
      })
    }),
    brand: defineCollection({
      type: 'data',
      source: 'brand.yml',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        values: z.object({
          description: z.string(),
          core: z.array(z.object({
            name: z.string(),
            description: z.string()
          }))
        }),
        logo: z.object({
          descriptions: z.object({
            main: z.string(),
            icon: z.string(),
            logo: z.string()
          }),
          usage: z.object({
            do: z.array(z.string()),
            dont: z.array(z.string())
          }),
          icons: z.array(z.object({
            name: z.string(),
            color: z.string(),
            icon: z.string(),
            usage: z.string(),
            svg: z.string(),
            png: z.string()
          }))
        }),
        colorPalette: z.object({
          description: z.string(),
          primary: z.array(z.object({
            name: z.string(),
            value: z.string(),
            usage: z.string()
          })),
          secondary: z.array(z.object({
            name: z.string(),
            value: z.string(),
            usage: z.string()
          }))
        }),
        typography: z.object({
          description: z.string(),
          primary: z.string(),
          secondary: z.string()
        }),
        imagery: z.object({
          description: z.string(),
          style: z.array(z.string()),
          screenshots: z.array(z.string())
        }),
        voice: z.object({
          description: z.string(),
          tone: z.array(z.string()),
          keywords: z.array(z.string())
        }),
        badge: z.object({
          description: z.string(),
          badges: z.array(z.object({
            name: z.string(),
            value: z.string(),
            usage: z.string(),
            markdown: z.object({}),
          })),
          usage: z.array(z.string()),
          placement: z.array(z.string())
        }),
        social: z.object({
          description: z.string(),
          platforms: z.array(z.object({
            logo: z.string(),
            handle: z.string(),
            link: z.string(),
            usage: z.string()
          }))
        })
      })
    }),
    legal: defineCollection({
      type: 'page',
      source: 'legal/**/*.md',
      schema: z.object({
        title: z.string().nonempty(),
        description: z.string().nonempty(),
        lastUpdated: z.string(),
        effectiveDate: z.string()
      })
    })
  }
})
