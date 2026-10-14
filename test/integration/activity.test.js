import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const TEST_ENV = process.env.TEST_ENV || 'staging';
const EVENT_LIMIT = { staging: '10', prod: '50' }[TEST_ENV] ?? '10';

test(`[${TEST_ENV}] build artifact dist/index.js exists`, () => {
  assert.ok(existsSync('dist/index.js'), 'dist/index.js missing - did the build artifact download?');
});

test(`[${TEST_ENV}] action runs successfully against the GitHub API`, () => {
  assert.ok(process.env.INPUT_GITHUB_TOKEN, 'Secret ACTIONSECRET2026 is not set');
  console.log(`Running integration test in TEST_ENV=${TEST_ENV} with EVENT_LIMIT=${EVENT_LIMIT}`);

  const result = spawnSync('node', ['dist/index.js'], {
    env: { ...process.env, INPUT_EVENT_LIMIT: EVENT_LIMIT },
    encoding: 'utf8',
    timeout: 60_000,
  });
  console.log(result.stdout);
  console.error(result.stderr);

  assert.equal(result.status, 0, 'action exited with a non-zero code');
  assert.doesNotMatch(result.stdout, /::error::/);
});
