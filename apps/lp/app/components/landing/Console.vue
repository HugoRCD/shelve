<script setup lang="ts">
type Command = {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

const commands = ref<Command[]>([
  {
    id: '1',
    name: 'Add new secret',
    icon: 'lucide:lock',
    description: 'Define a new secret variable for this project.'
  },
  {
    id: '2',
    name: 'Create a new project',
    icon: 'lucide:folder-plus',
    description: 'Add a project to your workspace.',
  },
  {
    id: '3',
    name: 'Manage environment',
    icon: 'lucide:cloud',
    description: 'Manage the environments for your current workspace.',
  },
  {
    id: 'lure-1',
    name: 'Check Logs',
    icon: 'lucide:file-text',
    description: 'View recent activity logs.',
  },
  {
    id: 'lure-2',
    name: 'Update Profile',
    icon: 'lucide:user-cog',
    description: 'Modify your user settings.',
  },
  {
    id: 'riddle-step-1',
    name: 'Receive Transmission',
    icon: 'lucide:binary',
    description: 'Execute to receive encrypted payload.',
  }
])

const selected = ref<Command>(commands.value[0]!)
const runtimeConfig = useRuntimeConfig()

const listHeightClass = 'h-[10.25rem]'

function handleExecute() {
  if (!selected.value) return

  if (selected.value.id === 'riddle-step-1') {
    toast.success('Payload received!')

    console.log('--- Shelve Secure Payload Received ---')
    console.log('Encrypted Vault ID:', runtimeConfig.public.payloadId)
    console.log('------------------------------------')
  } else {
    if (typeof toast !== 'undefined' && toast.success) {
      toast.success('Command executed successfully!')
    } else {
      console.log('Command executed:', selected.value.name)
    }
  }
}

</script>

<template>
  <BgHighlight class="scale-90 sm:scale-100 [mask-image:linear-gradient(to_bottom,white_50%,transparent)]">
    <div class="bg-(--ui-bg)/50 p-2 w-[400px] rounded-md">
      <div
        class="screen-container p-2 rounded-md bg-(--ui-bg) flex size-full flex-col gap-2"
        :class="[listHeightClass, 'overflow-y-scroll', 'scrollbar-hide']"
      >
        <div
          v-for="command in commands"
          :key="command.id"
          class="cursor-pointer flex items-center gap-3 rounded-md px-2 py-1 hover:bg-(--ui-bg-muted)"
          :class="{ 'bg-(--ui-bg-accented)/40': selected?.id === command.id }"
          @click="selected = command"
        >
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
      <div class="flex justify-end mt-2">
        <UButton size="xs" label="Execute" @click="handleExecute" />
      </div>
    </div>
  </BgHighlight>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
