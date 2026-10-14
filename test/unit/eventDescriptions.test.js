import { test } from 'node:test';
import assert from 'node:assert/strict';

// config.js reads GitHub Action inputs on import -> provide safe dummy values
process.env.INPUT_GITHUB_USERNAME ??= 'unit-test-user';
process.env.INPUT_GITHUB_TOKEN ??= 'dummy-token';
process.env.INPUT_EVENT_LIMIT ??= '10';
process.env.INPUT_OUTPUT_STYLE ??= 'MARKDOWN';

const { default: eventDescriptions } = await import('../../src/utils/eventDescriptions.js');

const repo = { name: 'octo/demo' };
const pr = { number: 7 };

test('every event handler is a function or a map of functions', () => {
  for (const [name, handler] of Object.entries(eventDescriptions)) {
    if (typeof handler === 'object') {
      for (const sub of Object.values(handler)) assert.equal(typeof sub, 'function', name);
    } else {
      assert.equal(typeof handler, 'function', name);
    }
  }
});

test('PushEvent (public) mentions the repository', () => {
  const text = eventDescriptions.PushEvent({
    repo, isPrivate: false,
    payload: { head: 'abc123', size: 1, commits: [{ sha: 'abc123' }] },
  });
  assert.match(text, /octo\/demo/);
});

test('PushEvent (private) does not leak the repository name', () => {
  const text = eventDescriptions.PushEvent({
    repo, isPrivate: true,
    payload: { head: 'abc123', size: 1, commits: [{ sha: 'abc123' }] },
  });
  assert.doesNotMatch(text, /octo\/demo/);
  assert.match(text, /private/i);
});

test('ForkEvent links to the forked repository', () => {
  const text = eventDescriptions.ForkEvent({ repo, isPrivate: false });
  assert.match(text, /https:\/\/github\.com\/octo\/demo/);
});

test('IssuesEvent.opened contains the issue number', () => {
  const text = eventDescriptions.IssuesEvent.opened({
    repo, isPrivate: false, payload: { issue: { number: 42 } },
  });
  assert.match(text, /#42/);
});

test('PullRequestEvent.merged contains the PR number', () => {
  const text = eventDescriptions.PullRequestEvent.merged({
    repo, pr, isPrivate: false, payload: { pull_request: pr },
  });
  assert.match(text, /#7/);
});
