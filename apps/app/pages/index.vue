<script setup lang="ts">
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex h-full flex-col items-center justify-center gap-3 p-5">
      <LandingHero class="h-64" />
    </div>
    <div class="flex flex-col gap-4 p-5">
      <h3 class="text-2xl font-bold">
        <LandingScrambleText label="Welcome to Shelve" />
      </h3>
      <div class="text-lg text-gray-500">
        <p>
          Shelve is a project management tool that helps you organize your projects in a simple and efficient way.
        </p>
        <p>
          It is designed to be easy to use and to help you keep track of your projects, tasks, and deadlines.
        </p>
        <p>
          With Shelve, you can create projects, add tasks to them, set deadlines, and assign tasks to team members.
        </p>
        <p>
          You can also track the progress of your projects, see who is working on what, and get notifications when tasks are completed.
        </p>
      </div>
    </div>
  </div>
</template>
