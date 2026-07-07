/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.js';
import * as languages from '../../../../common/languages.js';
import { getParameterLabelOffsets } from '../../browser/parameterHintsWidget.js';

suite('ParameterHintsWidget - getParameterLabelOffsets', () => {

	ensureNoDisposablesAreLeakedInTestSuite();

	test('should return correct offsets for simple parameter', () => {
		const signature: languages.SignatureInformation = {
			label: 'foo(x, y)',
			parameters: [
				{ label: 'x', documentation: '' },
				{ label: 'y', documentation: '' },
			]
		};

		assert.deepStrictEqual(getParameterLabelOffsets(signature, 0), [4, 5]);
		assert.deepStrictEqual(getParameterLabelOffsets(signature, 1), [7, 8]);
	});

	test('should return tuple label as-is', () => {
		const signature: languages.SignatureInformation = {
			label: 'foo(x, y)',
			parameters: [
				{ label: [4, 5] as [number, number], documentation: '' },
				{ label: [7, 8] as [number, number], documentation: '' },
			]
		};

		assert.deepStrictEqual(getParameterLabelOffsets(signature, 0), [4, 5]);
		assert.deepStrictEqual(getParameterLabelOffsets(signature, 1), [7, 8]);
	});

	test('should highlight correct occurrence when parameter name appears earlier in signature', () => {
		// "len" appears in "strlen" and also as a parameter name
		const signature: languages.SignatureInformation = {
			label: 'strlen(len, len)',
			parameters: [
				{ label: 'len', documentation: '' },
				{ label: 'len', documentation: '' },
			]
		};

		// First "len" parameter should match at position 7-10
		assert.deepStrictEqual(getParameterLabelOffsets(signature, 0), [7, 10]);
		// Second "len" parameter should match at position 12-15
		assert.deepStrictEqual(getParameterLabelOffsets(signature, 1), [12, 15]);
	});

	test('should highlight correct parameter when name is substring of function name', () => {
		// Issue #246019: "len" appears in function name "strlen"
		const signature: languages.SignatureInformation = {
			label: 'strlen(str, len)',
			parameters: [
				{ label: 'str', documentation: '' },
				{ label: 'len', documentation: '' },
			]
		};

		assert.deepStrictEqual(getParameterLabelOffsets(signature, 0), [7, 10]);
		assert.deepStrictEqual(getParameterLabelOffsets(signature, 1), [12, 15]);
	});

	test('should handle duplicate parameter names correctly', () => {
		const signature: languages.SignatureInformation = {
			label: 'func(a, a, a)',
			parameters: [
				{ label: 'a', documentation: '' },
				{ label: 'a', documentation: '' },
				{ label: 'a', documentation: '' },
			]
		};

		assert.deepStrictEqual(getParameterLabelOffsets(signature, 0), [5, 6]);
		assert.deepStrictEqual(getParameterLabelOffsets(signature, 1), [8, 9]);
		assert.deepStrictEqual(getParameterLabelOffsets(signature, 2), [11, 12]);
	});

	test('should return [0, 0] for missing parameter', () => {
		const signature: languages.SignatureInformation = {
			label: 'foo(x)',
			parameters: [
				{ label: 'x', documentation: '' },
			]
		};

		assert.deepStrictEqual(getParameterLabelOffsets(signature, 5), [0, 0]);
	});

	test('should return [0, 0] for empty parameter label', () => {
		const signature: languages.SignatureInformation = {
			label: 'foo(x)',
			parameters: [
				{ label: '', documentation: '' },
			]
		};

		assert.deepStrictEqual(getParameterLabelOffsets(signature, 0), [0, 0]);
	});

	test('should handle mixed tuple and string labels', () => {
		const signature: languages.SignatureInformation = {
			label: 'foo(len, len)',
			parameters: [
				{ label: [4, 7] as [number, number], documentation: '' },
				{ label: 'len', documentation: '' },
			]
		};

		// Second parameter should find "len" after position 7
		assert.deepStrictEqual(getParameterLabelOffsets(signature, 1), [9, 12]);
	});
});
