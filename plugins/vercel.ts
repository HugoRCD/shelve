import { inject } from "@vercel/analytics";

export default defineNuxtPlugin(() => {
  inject({
    beforeSend: (event) => {
      if (event.url.includes("localhost")) {
        return null;
      }
      return event;
    },
    debug: false,
  });
});
