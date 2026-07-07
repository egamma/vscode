/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { readFileSync } from 'fs';
import { join } from '../../../base/common/path.js';
import { FileAccess } from '../../../base/common/network.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../base/test/common/utils.js';

suite('ScrollDecoration', () => {
	ensureNoDisposablesAreLeakedInTestSuite();

	test('scroll-decoration CSS should have pointer-events: none to not block hover on top editor pixels', () => {
		const cssDir = FileAccess.asFileUri('vs/editor/browser/viewParts/scrollDecoration').fsPath;
		const cssPath = join(cssDir, 'scrollDecoration.css');
		const cssContent = readFileSync(cssPath, 'utf8');
		assert.ok(
			cssContent.includes('pointer-events: none'),
			'scroll-decoration.css must include "pointer-events: none" so the decorative shadow element does not block pointer events on the top pixels of the editor'
		);
	});
});
