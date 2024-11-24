export default defineEventHandler(async (event) => {
  const { toTest } = await readBody(event)

  const password = 'some_not_random_password_that_is_also_long_enough'

  console.log('To Encrypt:', toTest)
  const sealed = await seal(toTest, password)
  console.log('Sealed:', sealed)
  const unsealed = await unseal(sealed, password)
  console.log('Unsealed:', unsealed)
})
