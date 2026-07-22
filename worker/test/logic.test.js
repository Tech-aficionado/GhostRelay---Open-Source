/**
 * Unit tests for pure worker logic.
 * Run with: npm test  (uses Node's built-in test runner — no extra deps)
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
    matchPattern,
    wildcardToRegExp,
    getAliasBlockReason,
} from '../src/email.js';

// ===== wildcardToRegExp / matchPattern =====

test('wildcard * matches any run of characters in the local part', () => {
    assert.ok(matchPattern('anything-shopping', '*-shopping'));
    assert.ok(matchPattern('shop-anything', 'shop-*'));
    assert.ok(matchPattern('a-mid-b', 'a-*-b'));
    assert.ok(matchPattern('shopping', 'shopping'));
});

test('wildcard matching is case-insensitive', () => {
    assert.ok(matchPattern('SHOP-news', 'shop-*'));
    assert.ok(matchPattern('shop-NEWS', 'SHOP-*'));
});

test('non-matching local parts are rejected', () => {
    assert.equal(matchPattern('news-shop', 'shop-*'), false);
    assert.equal(matchPattern('shopping-extra', 'shopping'), false);
});

test('regex metacharacters in patterns are treated literally (no leak)', () => {
    // `?` must be literal, not "optional previous char"
    assert.ok(matchPattern('news?', 'news?'));
    assert.equal(matchPattern('new', 'news?'), false);

    // `.` must be literal, not "any char"
    assert.ok(matchPattern('a.b', 'a.b'));
    assert.equal(matchPattern('axb', 'a.b'), false);

    // `+` and other metachars must be literal
    assert.ok(matchPattern('a+b', 'a+b'));
    assert.equal(matchPattern('aaab', 'a+b'), false);
});

test('a bare * pattern matches within the local part but not across @', () => {
    const re = wildcardToRegExp('*');
    assert.ok(re.test('anything'));
    // The regex is only ever applied to the local part, but the [^@]* bound
    // guarantees it can never span an @ boundary.
    assert.equal(re.test('local@domain'), false);
});

test('wildcardToRegExp anchors the whole string', () => {
    const re = wildcardToRegExp('shop-*');
    assert.equal(re.source.startsWith('^'), true);
    assert.equal(re.source.endsWith('$'), true);
});

// ===== getAliasBlockReason =====

const NOW = new Date('2026-07-22T12:00:00.000Z');

test('null/undefined alias -> not_found', () => {
    assert.equal(getAliasBlockReason(null, NOW), 'not_found');
    assert.equal(getAliasBlockReason(undefined, NOW), 'not_found');
});

test('inactive alias -> disabled', () => {
    assert.equal(getAliasBlockReason({ active: 0 }, NOW), 'disabled');
    assert.equal(getAliasBlockReason({ active: false }, NOW), 'disabled');
});

test('expired temporary alias -> expired', () => {
    const alias = { active: 1, expires_at: '2026-07-21T12:00:00.000Z' };
    assert.equal(getAliasBlockReason(alias, NOW), 'expired');
});

test('not-yet-expired alias is deliverable', () => {
    const alias = { active: 1, expires_at: '2026-07-23T12:00:00.000Z' };
    assert.equal(getAliasBlockReason(alias, NOW), null);
});

test('alias at its email cap -> limit', () => {
    assert.equal(getAliasBlockReason({ active: 1, max_emails: 5, forwarded_count: 5 }, NOW), 'limit');
    assert.equal(getAliasBlockReason({ active: 1, max_emails: 5, forwarded_count: 6 }, NOW), 'limit');
});

test('alias below its email cap is deliverable', () => {
    assert.equal(getAliasBlockReason({ active: 1, max_emails: 5, forwarded_count: 4 }, NOW), null);
});

test('missing forwarded_count is treated as zero', () => {
    assert.equal(getAliasBlockReason({ active: 1, max_emails: 5 }, NOW), null);
});

test('disabled takes precedence over expiry and limit', () => {
    const alias = { active: 0, expires_at: '2020-01-01T00:00:00.000Z', max_emails: 1, forwarded_count: 99 };
    assert.equal(getAliasBlockReason(alias, NOW), 'disabled');
});

test('a plain active alias with no restrictions is deliverable', () => {
    assert.equal(getAliasBlockReason({ active: 1 }, NOW), null);
});
