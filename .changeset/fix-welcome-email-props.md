---
"app": patch
---

Fix the Vue warning `[Vue warn]: Missing required prop: "name"` when sending
the welcome email: the template declared a required `name` prop but the
`EmailService` passes `username` and `redirectUrl`. Aligned the props with
what the service actually sends, and wired `redirectUrl` into the call-to-
action button (it was hardcoded to `https://app.shelve.cloud` before).
