<script setup lang="ts">
const commands = ref([
  {
    id: '1',
    name: 'Add new secret',
    icon: 'lucide:lock',
    description: 'Create a new secret with the given name and value.'
  },
  {
    id: '2',
    name: 'Create a new project',
    icon: 'lucide:folder-plus',
    description: 'Create a new project with the given name and options.',
  },
  {
    id: '3',
    name: 'Manage environment',
    icon: 'lucide:cloud',
    description: 'Manage the environment variables for the project.',
  }
])

const selected = ref(commands.value[0])
</script>

<template>
  <BgHighlight class="scale-90 sm:scale-100 [mask-image:linear-gradient(to_bottom,white_50%,transparent)]">
    <div class="bg-(--ui-bg)/50 p-2 w-[400px] rounded-md">
      <div class="screen-container p-2 rounded-md bg-(--ui-bg) flex size-full flex-col gap-2">
        <div v-for="command in commands" :key="command.id" class="cursor-pointer flex items-center gap-3 rounded-md px-2 py-1 hover:bg-(--ui-bg-muted)" :class="{ 'bg-(--ui-bg-accented)/40': selected?.id === command.id }" @click="selected = command">
          <div class="flex items-center gap-3">
            <UIcon :name="command.icon" class="text-(--ui-text-muted)" />
            <div>
              <h3 class="text-sm font-semibold text-(--ui-text)">
                {{ command.name }}
              </h3>
              <p class="text-xs text-(--ui-text-muted)">
                {{ command.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <Separator />
      <div class="flex justify-end mt-2">
        <UButton size="xs" label="Execute" @click="toast.success('Command executed successfully!')" />
      </div>
    </div>
  </BgHighlight>
</template>
