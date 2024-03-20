<script setup lang="ts">
import type { Member } from "@shelve/types";
import type { PropType } from "vue";

const { teamId, members } = defineProps({
  teamId: {
    type: Number,
    required: true,
  },
  members: {
    type: Array as PropType<Member[]>,
    required: true,
  },
});
</script>

<template>
  <div />
</template>

<style scoped>

</style>
