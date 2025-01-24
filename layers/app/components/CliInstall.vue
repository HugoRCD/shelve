<script setup lang="ts">
const { user, fetch } = useUserSession()

const closed = ref(false)
const loading = ref(false)
async function installCli() {
  loading.value = true
  await $fetch('/api/user/cli', {
    method: 'POST',
  })
  await fetch()
  toast.success('Thank you for installing the Shelve CLI')
  loading.value = false
}

const pkg = '@shelve/cli'

type PackageCommands = {
  bun: string;
  pnpm: string;
  npm: string;
  yarn: string;
}

const pkgType = ref<PackageCommands>({
  bun: `bun add -d ${pkg}`,
  pnpm: `pnpm add --save-dev ${pkg}`,
  npm: `npm install --save-dev ${pkg}`,
  yarn: `yarn add --dev ${pkg}`
})

const items = ref([
  {
    label: 'Bun',
  },
  {
    label: 'Pnpm',
  },
  {
    label: 'Npm',
  },
  {
    label: 'Yarn',
  }
])

const copied = ref(false)

function copy(value: string) {
  copyToClipboard(value)
  copied.value = true

  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<template>
  <Callout v-if="user && !user.cliInstalled && !closed">
    <div class="flex flex-col gap-1">
      <h2 class="text-sm font-semibold">
        Install the Shelve CLI
      </h2>
      <p class="text-sm leading-6 dark:text-neutral-400 text-neutral-500">
        In order to fully utilize Shelve, you need to install the Shelve CLI.
      </p>
      <UTabs color="neutral" variant="link" :items class="w-full">
        <template #content="{ item }">
          <UInput v-model="pkgType[item.label.toLowerCase() as keyof PackageCommands]" :ui="{ trailing: 'pr-0.5' }" disabled class="w-full">
            <template v-if="pkg?.length" #trailing>
              <UTooltip text="Copy to clipboard" :content="{ side: 'right' }">
                <UButton
                  :color="copied ? 'success' : 'neutral'"
                  variant="link"
                  size="sm"
                  :icon="copied ? 'lucide:copy-check' : 'lucide:copy'"
                  aria-label="Copy to clipboard"
                  @click="copy(pkgType[item.label.toLowerCase() as keyof PackageCommands])"
                />
              </UTooltip>
            </template>
          </UInput>
        </template>
      </UTabs>
      <div class="flex items-center mt-2 gap-2">
        <UButton label="Maybe later" size="xs" variant="subtle" @click="closed = true" />
        <UButton label="I've installed the CLI" :loading size="xs" @click="installCli" />
      </div>
    </div>
  </Callout>
</template>
