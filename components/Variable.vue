<script setup lang="ts">
import type { Variable } from "~/types/Variables";
import type { PropType, Ref } from 'vue';

const props = defineProps({
  variable: {
    type: Object as PropType<Variable>,
    required: true
  },
});

const localVariable = ref(props.variable) as Ref<Variable>;

const { status, error, execute } = useFetch(`/api/variable`, {
  method: "POST",
  body: localVariable,
  watch: false,
  immediate: false,
})

async function updateCurrentVariable() {
  await execute();
  if (error.value) toast.error("An error occurred");
  else toast.success("Your variable has been updated");
}

const show = ref(false)
const showEdit = ref(false)
</script>

<template>
  <div class="flex cursor-pointer flex-col gap-3 rounded-md bg-secondary px-4 py-2">
    <div class="flex w-full items-center justify-between">
      <h3 class="flex flex-col text-lg font-semibold">
        {{ variable.key }}
        <span class="text-xs font-normal text-gray-500">
          {{ variable.environment }}
        </span>
      </h3>
      <div>
        <CButton @click="showEdit = !showEdit">
          Edit
        </CButton>
      </div>
    </div>
    <div v-if="showEdit" class="flex flex-col gap-2 py-2">
      <hr class="border-2 border-black/10">
      <form class="flex flex-col gap-4" @submit.prevent="updateCurrentVariable">
        <FormGroup v-model="localVariable.key" label="Key" />
        <FormGroup v-model="localVariable.value" label="Value" type="textarea" />
        <div class="mt-2 flex gap-4">
          <CButton type="submit" :loading="status === 'pending'">
            Save
          </CButton>
          <CButton type="submit" :loading="status === 'pending'">
            Delete
          </CButton>
        </div>
      </form>
    </div>


    <!-- <div class="flex gap-2">
      <CInput v-model="variable.value" class="rounded-md border-2 border-black/10 p-2" />
    </div>-->
  </div>
</template>

<style scoped>

</style>
