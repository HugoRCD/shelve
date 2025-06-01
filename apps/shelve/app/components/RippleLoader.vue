<template>
  <div class="size-full flex flex-col gap-4 items-center justify-center">
    <div class="relative">
      <Motion
        class="absolute -z-1 -inset-8 rounded-full border border-primary/10 aspect-square"
        :animate="{
          scale: [0.6, 1.8, 3.2, 0.6],
          opacity: [0, 0.4, 0.1, 0],
          rotate: [0, 120, 240, 360]
        }"
        :transition="{
          duration: 5,
          ease: 'easeInOut',
          repeat: Infinity,
          delay: 0.1
        }"
        :style="{ 
          background: 'radial-gradient(circle, rgba(0,0,0, 0.015) 0%, transparent 80%)',
          filter: 'blur(0.5px)'
        }"
      />

      <Motion
        class="absolute -z-1 -inset-6 rounded-full border border-primary/15 aspect-square"
        :animate="{
          scale: [0.7, 1.6, 2.8, 0.7],
          opacity: [0, 0.6, 0.15, 0],
          rotate: [0, 90, 180, 270]
        }"
        :transition="{
          duration: 4.2,
          ease: 'easeInOut',
          repeat: Infinity,
          delay: 0.3
        }"
        :style="{ 
          background: 'radial-gradient(circle, rgba(0,0,0, 0.02) 0%, transparent 70%)'
        }"
      />
      
      <Motion
        class="absolute -z-1 -inset-4 rounded-full border border-primary/25 aspect-square"
        :animate="{
          scale: [0.8, 1.4, 2.2, 0.8],
          opacity: [0, 0.7, 0.2, 0],
          rotate: [0, -75, -150, -225]
        }"
        :transition="{
          duration: 3.8,
          ease: 'easeInOut',
          repeat: Infinity,
          delay: 0.5
        }"
        :style="{ background: 'radial-gradient(circle, rgba(0,0,0, 0.025) 0%, transparent 65%)' }"
      />

      <Motion
        class="absolute -z-1 -inset-3 rounded-full border border-primary/35 aspect-square"
        :animate="{
          scale: [0.9, 1.3, 1.8, 0.9],
          opacity: [0, 0.8, 0.25, 0],
          rotate: [0, -60, -120, -180]
        }"
        :transition="{
          duration: 3.4,
          ease: 'easeInOut',
          repeat: Infinity,
          delay: 0.7
        }"
        :style="{ background: 'radial-gradient(circle, rgba(0,0,0, 0.03) 0%, transparent 60%)' }"
      />

      <Motion
        class="absolute -z-1 -inset-2 rounded-full border border-primary/45 aspect-square"
        :animate="{
          scale: [1, 1.2, 1.6, 1],
          opacity: [0, 0.6, 0.3, 0],
          rotate: [0, 45, 90, 135]
        }"
        :transition="{
          duration: 3,
          ease: 'easeInOut',
          repeat: Infinity,
          delay: 0.9
        }"
        :style="{ background: 'radial-gradient(circle, rgba(0,0,0, 0.035) 0%, transparent 50%)' }"
      />

      <Motion
        class="absolute -z-1 -inset-1 rounded-full border border-primary/55 aspect-square"
        :animate="{
          scale: [1.1, 1.15, 1.3, 1.1],
          opacity: [0, 0.4, 0.2, 0],
          rotate: [0, 30, 60, 90]
        }"
        :transition="{
          duration: 2.5,
          ease: 'easeInOut',
          repeat: Infinity,
          delay: 1.1
        }"
        :style="{ background: 'radial-gradient(circle, rgba(0,0,0, 0.04) 0%, transparent 40%)' }"
      />
      
      <div class="rounded-full flex items-center justify-center z-10 border-1 border-default bg-muted p-4 shadow-sm dark:shadow-lg">
        <Icon name="custom:shelve" class="size-8 animate-pulse" />
      </div>
    </div>
  </div>
</template> 
