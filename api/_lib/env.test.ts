import { afterEach, describe, expect, it } from 'vitest';
import { readRequiredEnv } from './env';

const ENV_VAR_NAME = 'WED_TEST_ENV_VAR';
const ORIGINAL_VALUE = process.env[ENV_VAR_NAME];

afterEach(() => {
  if (ORIGINAL_VALUE === undefined) {
    Reflect.deleteProperty(process.env, ENV_VAR_NAME);
  } else {
    process.env[ENV_VAR_NAME] = ORIGINAL_VALUE;
  }
});

describe('readRequiredEnv', () => {
  it('returnsTheValueWhenTheVariableIsSet', () => {
    process.env[ENV_VAR_NAME] = 'a-value';

    expect(readRequiredEnv(ENV_VAR_NAME)).toBe('a-value');
  });

  it('throwsWhenTheVariableIsMissing', () => {
    Reflect.deleteProperty(process.env, ENV_VAR_NAME);

    expect(() => readRequiredEnv(ENV_VAR_NAME)).toThrow(
      `Missing required environment variable: ${ENV_VAR_NAME}`,
    );
  });

  it('throwsWhenTheVariableIsAnEmptyString', () => {
    process.env[ENV_VAR_NAME] = '';

    expect(() => readRequiredEnv(ENV_VAR_NAME)).toThrow(
      `Missing required environment variable: ${ENV_VAR_NAME}`,
    );
  });
});
