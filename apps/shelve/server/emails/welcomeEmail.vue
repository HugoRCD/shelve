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
        Welcome to Shelve, {{ username }}
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
              Welcome to Shelve
            </Heading>

            <Text
              class="text-sm m-0 mb-2 leading-relaxed"
              style="color: rgba(255, 255, 255, 0.6);"
            >
              Hi <span style="color: #ffffff;">{{ username }}</span>,
            </Text>

            <Text
              class="text-sm m-0 mb-6 leading-relaxed"
              style="color: rgba(255, 255, 255, 0.6);"
            >
              Your account has been created. You can now start managing your secrets securely with Shelve.
            </Text>

            <!-- CTA Button -->
            <Button
              :href="redirectUrl"
              class="inline-block rounded-md px-5 py-2.5 text-sm font-medium no-underline"
              style="background-color: #ffffff; color: #010101;"
            >
              Open Shelve
            </Button>
          </Section>

          <!-- Divider -->
          <Hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.1); margin: 32px 0;" />

          <!-- Quick links -->
          <Section>
            <Text
              class="text-xs m-0 mb-3"
              style="color: rgba(255, 255, 255, 0.4);"
            >
              Get started:
            </Text>
            <Text class="text-sm m-0 mb-1">
              <Link
                href="https://shelve.cloud/docs/getting-started"
                class="no-underline"
                style="color: rgba(255, 255, 255, 0.7);"
              >
                Documentation →
              </Link>
            </Text>
            <Text class="text-sm m-0 mb-1">
              <Link
                href="https://shelve.cloud/docs/cli"
                class="no-underline"
                style="color: rgba(255, 255, 255, 0.7);"
              >
                CLI Guide →
              </Link>
            </Text>
            <Text class="text-sm m-0">
              <Link
                href="https://github.com/HugoRCD/shelve"
                class="no-underline"
                style="color: rgba(255, 255, 255, 0.7);"
              >
                GitHub →
              </Link>
            </Text>
          </Section>

          <!-- Footer -->
          <Section class="pt-10 pb-8">
            <Text
              class="text-xs m-0"
              style="color: rgba(255, 255, 255, 0.3);"
            >
              If you didn't create this account, please ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  </Tailwind>
</template>
