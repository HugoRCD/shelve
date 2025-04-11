export default defineNuxtPlugin(() => {
  const cookieName = 'userTimeSegment'
  const userTimeSegment = useCookie(cookieName, {
    maxAge: 60 * 60 * 12, // 12 hours
    path: '/',
    sameSite: 'lax',
  })

  if (!userTimeSegment.value) {
    const currentHour = new Date().getHours()
    let segment = 'default'

    if (currentHour >= 6 && currentHour < 12) {
      segment = 'morning'
    } else if (currentHour >= 12 && currentHour < 18) {
      segment = 'afternoon'
    } else {
      segment = 'evening'
    }
    userTimeSegment.value = segment
  }
})
