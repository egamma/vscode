/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.js';
import { computeSupportsPaste } from '../../browser/clipboard.js';

suite('Clipboard - computeSupportsPaste', () => {

	ensureNoDisposablesAreLeakedInTestSuite();

	test('returns true when navigator.clipboard is defined', () => {
		const fakeClipboard = {} as Clipboard;
		const result = computeSupportsPaste(fakeClipboard, () => false);
		assert.strictEqual(result, true);
	});

	test('falls back to queryCommandSupported when navigator.clipboard is undefined', () => {
		const result = computeSupportsPaste(undefined, () => true);
		assert.strictEqual(result, true);
	});

	test('returns false when navigator.clipboard is undefined and queryCommandSupported returns false', () => {
		const result = computeSupportsPaste(undefined, () => false);
		assert.strictEqual(result, false);
	});

	test('does not special-case any browser when clipboard API is available', () => {
		// This test verifies the fix for #184958: Firefox should not be excluded
		// when navigator.clipboard is available
		const fakeClipboard = {} as Clipboard;
		const result = computeSupportsPaste(fakeClipboard, () => false);
		assert.strictEqual(result, true, 'paste should be supported when clipboard API exists regardless of browser');
	});
});
