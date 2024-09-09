import { seal, unseal } from './crypto'

/*async function testSeal(): void {
  const password = 'some_not_random_password_that_is_also_long_enough'
  const object = {
    foo: 'bar',
    bar: [1, 2, 3],
  }

  console.log('To Encrypt:', object)
  const sealed = await seal(object, password)
  console.log('Sealed:', sealed)
  const unsealed = await unseal(sealed, password)
  console.log('Unsealed:', unsealed)
}

testSeal()*/

export {
  seal,
  unseal
}
