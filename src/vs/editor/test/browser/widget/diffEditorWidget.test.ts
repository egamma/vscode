/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../base/test/common/utils.js';
import { UnchangedRegion } from '../../../browser/widget/diffEditor/diffEditorViewModel.js';
import { DiffEditorOptions } from '../../../browser/widget/diffEditor/diffEditorOptions.js';
import { LineRange } from '../../../common/core/ranges/lineRange.js';
import { DetailedLineRangeMapping } from '../../../common/diff/rangeMapping.js';
import { TestAccessibilityService } from '../../../../platform/accessibility/test/common/testAccessibilityService.js';

suite('DiffEditorWidget2', () => {

	ensureNoDisposablesAreLeakedInTestSuite();

	suite('UnchangedRegion', () => {
		function serialize(regions: UnchangedRegion[]): unknown {
			return regions.map(r => `${r.originalUnchangedRange} - ${r.modifiedUnchangedRange}`);
		}

		test('Everything changed', () => {
			assert.deepStrictEqual(serialize(UnchangedRegion.fromDiffs(
				[new DetailedLineRangeMapping(new LineRange(1, 10), new LineRange(1, 10), [])],
				10,
				10,
				3,
				3,
			)), []);
		});

		test('Nothing changed', () => {
			assert.deepStrictEqual(serialize(UnchangedRegion.fromDiffs(
				[],
				10,
				10,
				3,
				3,
			)), [
				'[1,11) - [1,11)'
			]);
		});

		test('Change in the middle', () => {
			assert.deepStrictEqual(serialize(UnchangedRegion.fromDiffs(
				[new DetailedLineRangeMapping(new LineRange(50, 60), new LineRange(50, 60), [])],
				100,
				100,
				3,
				3,
			)), ([
				'[1,47) - [1,47)',
				'[63,101) - [63,101)'
			]));
		});

		test('Change at the end', () => {
			assert.deepStrictEqual(serialize(UnchangedRegion.fromDiffs(
				[new DetailedLineRangeMapping(new LineRange(99, 100), new LineRange(100, 100), [])],
				100,
				100,
				3,
				3,
			)), (['[1,96) - [1,96)']));
		});
	});

	suite('DiffEditorOptions', () => {
		test('diffWordWrap setting is correctly exposed for inline and side-by-side modes', () => {
			const accessibilityService = new TestAccessibilityService();

			// Test with diffWordWrap 'on' and inline mode
			const inlineOptions = new DiffEditorOptions({
				diffWordWrap: 'on',
				renderSideBySide: false,
			}, accessibilityService);

			assert.strictEqual(inlineOptions.diffWordWrap.get(), 'on',
				'diffWordWrap should be "on" when configured as "on"');

			// Test with diffWordWrap 'inherit' (the default)
			const defaultOptions = new DiffEditorOptions({
				diffWordWrap: 'inherit',
				renderSideBySide: false,
			}, accessibilityService);

			assert.strictEqual(defaultOptions.diffWordWrap.get(), 'inherit',
				'diffWordWrap should be "inherit" when set to inherit');

			// Test with diffWordWrap 'off'
			const offOptions = new DiffEditorOptions({
				diffWordWrap: 'off',
				renderSideBySide: false,
			}, accessibilityService);

			assert.strictEqual(offOptions.diffWordWrap.get(), 'off',
				'diffWordWrap should be "off" when set to off');
		});

		test('diffWordWrap can be updated dynamically', () => {
			const accessibilityService = new TestAccessibilityService();

			const options = new DiffEditorOptions({
				diffWordWrap: 'off',
				renderSideBySide: false,
			}, accessibilityService);

			assert.strictEqual(options.diffWordWrap.get(), 'off');

			options.updateOptions({ diffWordWrap: 'on' });
			assert.strictEqual(options.diffWordWrap.get(), 'on',
				'diffWordWrap should update to "on" after updateOptions');
		});
	});
});
