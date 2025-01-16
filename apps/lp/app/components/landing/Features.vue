<script setup lang="ts">
const features = [
  {
    title: 'Seamless Environment Management',
    description: 'One login, all projects. Push and pull environment variables instantly across your entire team without the hassle.',
    icon: 'lucide:lock',
  },
  {
    title: 'Powerful CLI Experience',
    description: 'A CLI-first approach that makes managing env variables feel natural. Simple commands, powerful results.',
    icon: 'lucide:terminal',
  },
  {
    title: 'Built for Teams',
    description: 'Manage multiple teams, control access levels, and collaborate effortlessly. Perfect for organizations with multiple projects.',
    icon: 'lucide:users',
  },
  {
    title: 'Native Monorepo Support',
    description: 'Working with monorepos? Shelve automatically detects and manages configurations across all your projects.',
    icon: 'lucide:git-fork',
  },
  {
    title: 'GitHub Integration',
    description: 'Sync your environment variables directly with GitHub Secrets. One click to secure your GitHub Actions workflows.',
    icon: 'simple-icons:github',
  },
  {
    title: 'Self-Hosting Ready',
    description: 'Deploy Shelve on your own infrastructure with Docker or through NuxtHub. Keep full control of your data.',
    icon: 'lucide:cloud',
  },
  {
    title: 'Advanced Integrations',
    description: 'More integrations coming soon: Vercel, Coolify, and more.',
    icon: 'lucide:puzzle',
    soon: true,
  },
]
</script>

<template>
  <div>
    <div class="mb-10 flex flex-col items-center justify-center gap-2">
      <h3 class="main-gradient text-3xl">
        <LandingScrambleText label="Features" />
      </h3>
      <p class="max-w-lg text-pretty text-center text-sm text-neutral-500 sm:text-base">
        Shelve is packed with features that make managing your environment variables a breeze. Here are some of the highlights.
      </p>
    </div>
    <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-y-16">
      <UPageFeature
        v-for="(feature, index) in features"
        :key="index"
        orientation="horizontal"
        :title="feature.title"
        :description="feature.description"
        :icon="feature.icon"
        :style="{ '--stagger': index + 1 }"
        data-animate
      />
    </div>
  </div>
</template>
