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

	suite('DiffEditorOptions - word wrap in inline mode', () => {

		test('diffWordWrap "on" is respected in inline mode (original editor should wrap)', () => {
			const accessibilityService = new TestAccessibilityService();
			const options = new DiffEditorOptions(
				{ renderSideBySide: false, diffWordWrap: 'on' },
				accessibilityService,
			);

			// In inline mode, renderSideBySide is false
			assert.strictEqual(options.renderSideBySide.get(), false);
			// diffWordWrap is 'on' — this value is used as wordWrapOverride1
			// for the original (left) editor in _adjustOptionsForLeftHandSide.
			// Before the fix, this was always overridden to 'off' in inline mode.
			assert.strictEqual(options.diffWordWrap.get(), 'on');
		});

		test('diffWordWrap "off" disables wrap in inline mode', () => {
			const accessibilityService = new TestAccessibilityService();
			const options = new DiffEditorOptions(
				{ renderSideBySide: false, diffWordWrap: 'off' },
				accessibilityService,
			);

			assert.strictEqual(options.renderSideBySide.get(), false);
			assert.strictEqual(options.diffWordWrap.get(), 'off');
		});

		test('diffWordWrap "inherit" is passed through in inline mode', () => {
			const accessibilityService = new TestAccessibilityService();
			const options = new DiffEditorOptions(
				{ renderSideBySide: false, diffWordWrap: 'inherit' },
				accessibilityService,
			);

			assert.strictEqual(options.renderSideBySide.get(), false);
			assert.strictEqual(options.diffWordWrap.get(), 'inherit');
		});
	});
});
