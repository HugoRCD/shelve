import { expect, test, describe } from 'vitest';
import { writeUserConfig, loadUserConfig, updateUserConfig } from "../src/utils/config.ts";

describe('config', () => {
  test('Should write the user config', () => {
    const config = {
      username: "test",
      email: "test@gmail.com",
      authToken: "123456"
    };
    writeUserConfig(config);
  });
});
