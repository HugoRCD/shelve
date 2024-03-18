<script setup lang="ts">
const { refresh } = defineProps({
  refresh: {
    type: Function,
    required: true,
  },
})
const projectCreateInput = ref({
  name: "",
  description: "",
  avatar: "",
  repository: "",
  projectManager: "",
  homepage: "",
})

const createModal = ref(false)
const isOpen = ref(false)

const { status: createStatus, error: createError, execute } = useFetch("/api/project", {
  method: "POST",
  body: projectCreateInput,
  watch: false,
  immediate: false,
})

async function createProject() {
  await execute()
  if (createError.value) toast.error("An error occurred")
  else {
    toast.success("Your project has been created")
    createModal.value = false
    await refresh()
  }
}

const teamMembers = ref([
  {
    id: 1,
    name: "Benjamin Canac",
    avatar: "https://avatars.githubusercontent.com/u/739984?v=4",
  },
  {
    id: 2,
    name: "Anthony Gore",
    avatar: "https://avatars.githubusercontent.com/u/904724?v=4",
  },
  {
    id: 3,
    name: "Sébastien Marroufi",
    avatar: "https://avatars.githubusercontent.com/u/7547335?v=4",
  },
])

function addTeamMember() {
  teamMembers.value.push({
    id: teamMembers.value.length + 1,
    name: "New member",
    avatar: "",
  })
}

function removeTeamMember(index: number) {
  teamMembers.value.splice(index, 1)
}

function importProject() {
  const input = document.createElement("input")
  input.type = "file"
  input.accept = ".json"
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result
        if (typeof content === "string") {
          const data = JSON.parse(content)
          projectCreateInput.value = {
            ...projectCreateInput.value,
            ...data,
          }
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}
</script>

<template>
  <div>
    <UButton
      size="xs"
      icon="i-heroicons-plus-20-solid"
      :loading="createStatus === 'pending'"
      label="Add project"
      @click="isOpen = true"
    />

    <USlideover v-model="isOpen">
      <form class="flex flex-1 overflow-y-auto" @submit.prevent="createProject">
        <UCard class="flex flex-1 flex-col" :ui="{ body: { base: 'flex-1' }, ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
          <template #header>
            <h3 class="text-lg font-semibold">
              Create a new project
            </h3>
            <p class="text-sm font-normal text-gray-500">
              Its time to create a new project, let's get started!
            </p>
          </template>

          <div class="flex flex-col gap-4 p-2">
            <FormGroup v-model="projectCreateInput.name" required label="Project name" />
            <FormGroup v-model="projectCreateInput.description" label="Description" type="textarea" />
            <UDivider class="my-4" />
            <div class="flex flex-col gap-4">
              <div>
                <h3 class="font-semibold">
                  Team Members
                </h3>
                <p class="text-pretty text-xs text-neutral-500 dark:text-neutral-400">
                  Add team members to your project
                </p>
              </div>
              <UAvatarGroup size="sm" :max="6">
                <div class="flex size-8 cursor-pointer items-center justify-center rounded-full border border-dashed border-gray-400" @click="addTeamMember">
                  +
                </div>
                <UAvatar
                  v-for="(member, index) in teamMembers"
                  :key="member.id"
                  :src="member.avatar"
                  :alt="member.name"
                  size="sm"
                  @click="removeTeamMember(index)"
                />
              </UAvatarGroup>
            </div>
            <UDivider class="my-4" />
            <div class="flex flex-col gap-4">
              <div>
                <h3 class="font-semibold">
                  Quick Links
                </h3>
                <p class="text-pretty text-xs text-neutral-500 dark:text-neutral-400">
                  Add quick links to your project repository, homepage, etc...
                </p>
              </div>
              <div>
                <FormGroup v-model="projectCreateInput.repository" label="Repository" />
              </div>
              <div>
                <FormGroup v-model="projectCreateInput.projectManager" label="Project Manager" />
              </div>
              <div>
                <FormGroup v-model="projectCreateInput.homepage" label="Homepage" />
              </div>
            </div>
            <UDivider class="my-4" />
            <div class="flex flex-col gap-4">
              <div>
                <h3 class="font-semibold">
                  Avatar
                </h3>
                <p class="text-pretty text-xs text-neutral-500 dark:text-neutral-400">
                  Add an avatar to your project
                </p>
              </div>
              <div class="flex flex-col items-center justify-center gap-4">
                <FormGroup v-model="projectCreateInput.avatar" label="Project avatar" class="w-full" />
                <UAvatar :src="projectCreateInput.avatar" size="3xl" :alt="projectCreateInput.name" />
              </div>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-between">
              <div>
                <UButton color="gray" variant="ghost" @click="importProject">
                  Import project from JSON
                </UButton>
              </div>
              <div class="flex gap-4">
                <UButton color="gray" variant="ghost" @click="isOpen = false">
                  Cancel
                </UButton>
                <UButton color="primary" type="submit" trailing :loading="createStatus === 'pending'">
                  Save
                </UButton>
              </div>
            </div>
          </template>
        </UCard>
      </form>
    </USlideover>
  </div>
</template>
