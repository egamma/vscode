/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { URI } from '../../../../base/common/uri.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../base/test/common/utils.js';
import { WorkerBasedDocumentDiffProvider } from '../../../browser/widget/diffEditor/diffProviderFactoryService.js';
import { LineRange } from '../../../common/core/ranges/lineRange.js';
import { IDocumentDiff, IDocumentDiffProviderOptions } from '../../../common/diff/documentDiffProvider.js';
import { DetailedLineRangeMapping, RangeMapping } from '../../../common/diff/rangeMapping.js';
import { IEditorWorkerService, DiffAlgorithmName } from '../../../common/services/editorWorker.js';
import { ITextModel } from '../../../common/model.js';
import { NullTelemetryService } from '../../../../platform/telemetry/common/telemetryUtils.js';
import { Range } from '../../../common/core/range.js';

suite('WorkerBasedDocumentDiffProvider', () => {

	const store = ensureNoDisposablesAreLeakedInTestSuite();

	function createMockTextModel(uri: URI, lineCount: number): ITextModel {
		return {
			uri,
			id: uri.toString(),
			isDisposed: () => false,
			getLineCount: () => lineCount,
			getLineMaxColumn: () => 10,
			getAlternativeVersionId: () => 1,
			getFullModelRange: () => new Range(1, 1, lineCount, 10),
		} as unknown as ITextModel;
	}

	test('falls back to legacy algorithm when advanced quits early', async () => {
		const originalUri = URI.parse('file:///original.txt');
		const modifiedUri = URI.parse('file:///modified.txt');

		const advancedResult: IDocumentDiff = {
			changes: [],
			identical: false,
			quitEarly: true,
			moves: [],
		};

		const legacyResult: IDocumentDiff = {
			changes: [
				new DetailedLineRangeMapping(
					new LineRange(1, 5),
					new LineRange(1, 8),
					[new RangeMapping(new Range(1, 1, 4, 10), new Range(1, 1, 7, 10))]
				)
			],
			identical: false,
			quitEarly: false,
			moves: [],
		};

		let lastAlgorithmUsed: DiffAlgorithmName | undefined;

		const mockEditorWorkerService: Partial<IEditorWorkerService> = {
			computeDiff(_original: URI, _modified: URI, _options: IDocumentDiffProviderOptions, algorithm: DiffAlgorithmName): Promise<IDocumentDiff | null> {
				lastAlgorithmUsed = algorithm;
				if (algorithm === 'advanced') {
					return Promise.resolve(advancedResult);
				}
				return Promise.resolve(legacyResult);
			}
		};

		const provider = store.add(new WorkerBasedDocumentDiffProvider(
			{ diffAlgorithm: 'advanced' },
			mockEditorWorkerService as IEditorWorkerService,
			NullTelemetryService,
		));

		const original = createMockTextModel(originalUri, 100);
		const modified = createMockTextModel(modifiedUri, 120);

		const result = await provider.computeDiff(original, modified, {
			ignoreTrimWhitespace: true,
			maxComputationTimeMs: 5000,
			computeMoves: false,
		}, CancellationToken.None);

		assert.strictEqual(lastAlgorithmUsed, 'legacy');
		assert.strictEqual(result.quitEarly, false);
		assert.strictEqual(result.changes.length, 1);
	});

	test('does not fallback when legacy algorithm quits early', async () => {
		const originalUri = URI.parse('file:///original2.txt');
		const modifiedUri = URI.parse('file:///modified2.txt');

		const legacyQuitEarlyResult: IDocumentDiff = {
			changes: [],
			identical: false,
			quitEarly: true,
			moves: [],
		};

		const callLog: DiffAlgorithmName[] = [];

		const mockEditorWorkerService: Partial<IEditorWorkerService> = {
			computeDiff(_original: URI, _modified: URI, _options: IDocumentDiffProviderOptions, algorithm: DiffAlgorithmName): Promise<IDocumentDiff | null> {
				callLog.push(algorithm);
				return Promise.resolve(legacyQuitEarlyResult);
			}
		};

		const provider = store.add(new WorkerBasedDocumentDiffProvider(
			{ diffAlgorithm: 'legacy' },
			mockEditorWorkerService as IEditorWorkerService,
			NullTelemetryService,
		));

		const original = createMockTextModel(originalUri, 100);
		const modified = createMockTextModel(modifiedUri, 120);

		const result = await provider.computeDiff(original, modified, {
			ignoreTrimWhitespace: true,
			maxComputationTimeMs: 5000,
			computeMoves: false,
		}, CancellationToken.None);

		// Should only call once with legacy, no retry
		assert.deepStrictEqual(callLog, ['legacy']);
		assert.strictEqual(result.quitEarly, true);
	});
});
