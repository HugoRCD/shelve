<script setup lang="ts">
defineProps({
  otp: {
    type: String,
    required: true
  },
  redirectUrl: {
    type: String,
    required: true
  }
});
</script>

<template>
  <ETailwind>
    <EHtml>
      <EHead />
      <EPreview>
        Welcome to the Shelves
      </EPreview>
      <EBody class="m-auto bg-white font-sans">
        <EContainer class="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-[20px] md:p-7">
          <EHeading class="mb-4 text-center text-2xl font-bold text-[#000000] md:text-3xl">
            Welcome to the Shelves
          </EHeading>
          <EText class="mb-4 text-center text-[#000000]">
            Your OTP is <span class="font-semibold">{{ otp }}</span>
          </EText>
          <EText class="mb-4 text-center text-[#000000]">
            Use this OTP to verify your account
          </EText>
          <ESection class="my-[32px] text-center">
            <EButton px="20" py="12" class="rounded bg-[#000000] text-center text-[12px] font-semibold text-white no-underline" :href="redirectUrl">
              Go to Shelves
            </EButton>
          </ESection>
          <EText class="text-[14px] leading-[24px] text-black">
            or copy and paste this URL into your browser:
            <ELink :href="redirectUrl" class="text-[#2C3BF5]">
              {{ redirectUrl }}
            </ELink>
          </EText>
          <EHr class="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
          <EText class="text-[12px] leading-[24px] text-[#666666]">
            If you were not expecting this invitation, you can ignore this email. If you are concerned about your account's safety, please reply to this email to get in touch
            with us.
          </EText>
        </EContainer>
      </EBody>
    </EHtml>
  </ETailwind>
</template>

<style scoped>

</style>
