<script setup lang="ts">
const props = defineProps({
  digitCount: {
    type: Number,
    default: 6
  },
  disabled: Boolean
});

const otpRef = ref<HTMLDivElement>()
const otpInputs = ref<Array<HTMLInputElement | null>>([]);

const digits = reactive<[string | null]>([null]);

const otp = defineModel({ type: String });

for (let i = 0; i < props.digitCount; i++) {
  digits[i] = otp.value![i] || null;
}


const emit = defineEmits(['otp:full']);

const isDigitsFull = function () {
  for (const elem of digits) {
    if (elem == null || elem == undefined) {
      return false;
    }
  }
  return true;
}

const handleKeyDown = function (event: KeyboardEvent, index: number) {
  if (!otpRef.value) return;
  if (event.key !== "Tab" &&
      event.key !== "ArrowRight" &&
      event.key !== "ArrowLeft"
  ) {
    event.preventDefault();
  }

  if (event.key === "Backspace") {
    digits[index] = null;
    if (index != 0) {
      (otpRef.value.children)[index - 1].focus();
    }
    otp.value = digits.join('');
    otp.value = otp.value.slice(0, -1);
    return;
  }

  if ((new RegExp('^([0-9])$')).test(event.key)) {
    digits[index] = event.key;
    if (index != props.digitCount - 1) {
      (otpRef.value.children)[index + 1].focus();
    }
    otp.value = digits.join('');
  }

  if (isDigitsFull()) {
    emit('otp:full', otp.value);
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div ref="otpRef" class="flex justify-center gap-4">
      <input
        v-for="(el, index) in digits"
        ref="otpInputs"
        :key="el+index"
        v-model="digits[index]"
        type="text"
        class="digit-box"
        :autofocus="index === 0"
        :placeholder="index+1"
        :disabled
        maxlength="1"
        @keydown="handleKeyDown($event, index)"
      >
    </div>
  </div>
</template>

<style scoped>
.digit-box {
  @apply size-12 rounded-md text-center text-2xl text-primary outline-none;
  @apply bg-white dark:bg-secondary ring-2 ring-transparent focus:ring-accent placeholder-gray-600/30;
  @apply border-[1px] dark:border-white/5 border-black/10;
}
</style>
