<template>
  <div class="relative -mb-px -ml-px">
    <span class="bottom absolute -bottom-px -left-px size-px" />
    <span class="bottom absolute -bottom-px -right-px size-px" />
    <span class="bottom absolute -left-px -top-px size-px" />
    <span class="bottom absolute -right-px -top-px size-px" />
    <div class="relative z-10 flex h-full flex-col justify-center">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.bottom:before {
  --tw-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity));
  content: "";
  width: 1px;
  height: 9px;
  position: absolute;
  top: -4px;
}

.bottom:after {
  --tw-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity));
  content: "";
  width: 9px;
  height: 1px;
  position: absolute;
  left: -4px;
}

.encryption {
  --x: 80%;
  --y: 0%;
  transition: .5s;
  -webkit-mask-image: radial-gradient(300px circle at var(--x) var(--y), #000 10%, rgba(0, 0, 0, .25), transparent);
  mask-image: radial-gradient(300px circle at var(--x) var(--y), #000 10%, rgba(0, 0, 0, .25), transparent);
  opacity: .4;
}
</style>
