import Crypto from 'crypto-js'
import { defaults, seal, unseal } from './crypto'

export function encrypt(toEncrypt: string, secretKey: string, iterations: number): string {
  let result = toEncrypt
  for (let i = 0; i < iterations; i++) {
    result = Crypto.AES.encrypt(result, secretKey).toString()
  }
  return result
}

export function decrypt(toDecrypt: string, secretKey: string, iterations: number): string {
  let result = toDecrypt
  for (let i = 0; i < iterations; i++) {
    result = Crypto.AES.decrypt(result, secretKey).toString(Crypto.enc.Utf8)
  }
  return result
}

/*
function testEncryptDecrypt() {
  const secretKey = "my-secret";
  const toEncrypt = "https://hrcd.fr/";
  const iterations = 10; // Example: Encrypt and decrypt 3 times
  console.log("To Encrypt:", toEncrypt);
  const encrypted = encrypt(toEncrypt, secretKey, iterations);
  console.log("Encrypted:", encrypted);
  const decrypted = decrypt(encrypted, secretKey, iterations);
  console.log("Decrypted:", decrypted);
}

testEncryptDecrypt();
*/

async function testSeal(): void {
  const password = 'some_not_random_password_that_is_also_long_enough'
  const object = {
    foo: 'bar',
    bar: [1, 2, 3],
  }

  console.log('To Encrypt:', object)
  const sealed = await seal(object, password, defaults)
  console.log('Sealed:', sealed)
  const unsealed = await unseal(sealed, password, defaults)
  console.log('Unsealed:', unsealed)
}

testSeal()
