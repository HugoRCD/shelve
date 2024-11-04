<script setup lang="ts">
import {
  Tailwind,
  Container,
  Text,
  Preview,
  Heading,
  Button,
  Html,
  Body,
  Link,
  Section,
  Head,
  Hr
} from '@vue-email/components'

defineProps({
  username: {
    type: String,
    required: true
  },
  redirectUrl: {
    type: String,
    required: true
  }
})
</script>

<template>
  <Tailwind>
    <Html>
      <Head />
      <Preview>
        Welcome to Shelve!
      </Preview>
      <Body class="m-auto bg-white font-sans">
        <Container class="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-[20px] md:p-7">
          <Heading class="mb-4 text-center text-2xl font-bold text-[#000000] md:text-3xl">
            Welcome to Shelve, {{ username }}!
          </Heading>
          <Text class="mb-4 text-center text-[#000000]">
            We're excited to have you on board. Here are some next steps to get you started:
          </Text>
          <Text class="mb-4 text-left text-[#000000]">
            1. Explore our <Link :href="`${redirectUrl}/docs`" class="text-[#2C3BF5]">
              documentation
            </Link> to learn more about Shelve's features.
          </Text>
          <Text class="mb-4 text-left text-[#000000]">
            2. Check out our <Link :href="`${redirectUrl}/roadmap`" class="text-[#2C3BF5]">
              roadmap
            </Link> to see what's coming next.
          </Text>
          <Text class="mb-4 text-left text-[#000000]">
            4. Start a new project and invite your team members to collaborate.
          </Text>
          <Section class="my-[32px] text-center">
            <Button class="rounded bg-[#000000] px-8 py-3 text-center text-[12px] font-semibold text-white no-underline" :href="redirectUrl">
              Go to Shelve
            </Button>
          </Section>
          <Text class="text-[14px] leading-[24px] text-black">
            or copy and paste this URL into your browser:
            <Link :href="redirectUrl" class="text-[#2C3BF5]">
              {{ redirectUrl }}
            </Link>
          </Text>
          <Hr class="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
          <Text class="text-[12px] leading-[24px] text-[#666666]">
            If you were not expecting this email, you can safely ignore it. If you have any questions or need assistance, please send an email to contact@hrcd.fr
          </Text>
        </Container>
      </Body>
    </Html>
  </Tailwind>
</template>

<style scoped>

</style>
