<script setup lang="ts">
const props = defineProps({
  default: String,
  digitCount: {
    type: Number,
    required: true
  },
  disabled: Boolean
});

const digits = reactive<[string | null]>([null]);

if (props.default && props.default.length === props.digitCount) {
  for (let i =0; i < props.digitCount; i++) {
    digits[i] = props.default.charAt(i)
  }
} else {
  for (let i =0; i < props.digitCount; i++) {
    digits[i] = null;
  }
}

const otpCont = ref<HTMLDivElement>()

const emit = defineEmits(['update:otp']);

const isDigitsFull = function () {
  for (const elem of digits) {
    if (elem == null || elem == undefined) {
      return false;
    }
  }

  return true;
}

const handleKeyDown = function (event: KeyboardEvent, index: number) {
  if (!otpCont.value) return;
  if (event.key !== "Tab" &&
      event.key !== "ArrowRight" &&
      event.key !== "ArrowLeft"
  ) {
    event.preventDefault();
  }

  if (event.key === "Backspace") {
    digits[index] = null;

    if (index != 0) {
      (otpCont.value.children)[index-1].focus();
    }

    return;
  }

  if ((new RegExp('^([0-9])$')).test(event.key)) {
    digits[index] = event.key;

    if (index != props.digitCount - 1) {
      (otpCont.value.children)[index+1].focus();
    }
  }

  if (isDigitsFull()) {
    emit('update:otp', digits.join(''))
  }
}
</script>

<template>
  <div ref="otpCont" class="flex justify-center gap-4">
    <input
      v-for="(el, ind) in digits"
      :key="el+ind"
      v-model="digits[ind]"
      type="text"
      class="digit-box"
      :autofocus="ind === 0"
      :placeholder="ind+1"
      :disabled
      maxlength="1"
      @keydown="handleKeyDown($event, ind)"
    >
  </div>
</template>

<style scoped>
.digit-box {
  @apply size-12 rounded-md text-center text-2xl text-primary outline-none;
  @apply bg-secondary ring-2 ring-transparent focus:ring-accent placeholder-gray-600/30;
}
</style>
