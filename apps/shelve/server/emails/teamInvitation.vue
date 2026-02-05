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
  Hr,
  Img,
  Font
} from '@vue-email/components'

defineProps({
  teamName: {
    type: String,
    required: true
  },
  inviterName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  inviteUrl: {
    type: String,
    required: true
  }
})
</script>

<template>
  <Tailwind>
    <Html>
      <Head>
        <Font
          font-family="Geist"
          fallback-font-family="Helvetica"
          :web-font="{
            url: 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&display=swap',
            format: 'woff2',
          }"
          font-weight="400 500 600"
          font-style="normal"
        />
      </Head>
      <Preview>
        {{ inviterName }} invited you to join {{ teamName }} on Shelve
      </Preview>
      <Body class="m-0 p-0 font-sans" style="background-color: #010101;">
        <Container class="mx-auto my-10 max-w-[480px] px-6">
          <!-- Header with logo -->
          <Section class="pt-10 pb-8">
            <img
              src="https://shelve.cloud/logo/icon-white.svg"
              alt="Shelve"
              width="48"
              height="48"
              style="width: 48px; height: 48px; min-width: 48px; min-height: 48px; display: block;"
            >
          </Section>

          <!-- Main content -->
          <Section>
            <Heading
              class="text-xl font-medium m-0 mb-3"
              style="color: #ffffff; letter-spacing: -0.3px;"
            >
              Join {{ teamName }}
            </Heading>

            <Text
              class="text-sm m-0 mb-6 leading-relaxed"
              style="color: rgba(255, 255, 255, 0.6);"
            >
              <span style="color: #ffffff;">{{ inviterName }}</span> has invited you to collaborate on <span style="color: #ffffff;">{{ teamName }}</span> as a <span style="color: #ffffff;">{{ role }}</span>.
            </Text>

            <!-- CTA Button -->
            <Button
              :href="inviteUrl"
              class="inline-block rounded-md px-5 py-2.5 text-sm font-medium no-underline"
              style="background-color: #ffffff; color: #010101;"
            >
              Accept invitation
            </Button>
          </Section>

          <!-- Divider -->
          <Hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.1); margin: 32px 0;" />

          <!-- Link fallback -->
          <Section>
            <Text
              class="text-xs m-0 mb-2"
              style="color: rgba(255, 255, 255, 0.4);"
            >
              Or copy this link:
            </Text>
            <Link
              :href="inviteUrl"
              class="text-xs break-all no-underline"
              style="color: rgba(255, 255, 255, 0.5);"
            >
              {{ inviteUrl }}
            </Link>
          </Section>

          <!-- Footer -->
          <Section class="pt-10 pb-8">
            <Text
              class="text-xs m-0 mb-1"
              style="color: rgba(255, 255, 255, 0.3);"
            >
              This invitation expires in 7 days.
            </Text>
            <Text
              class="text-xs m-0"
              style="color: rgba(255, 255, 255, 0.3);"
            >
              If you didn't expect this, you can ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  </Tailwind>
</template>
