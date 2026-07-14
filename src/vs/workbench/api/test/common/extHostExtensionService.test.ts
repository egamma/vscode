/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { URI } from '../../../../base/common/uri.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../base/test/common/utils.js';
import { ExtensionIdentifier, IExtensionDescription } from '../../../../platform/extensions/common/extensions.js';
import { Extension, IExtHostExtensionService } from '../../common/extHostExtensionService.js';
import { ExtensionKind } from '../../common/extHostTypes.js';
import { nullExtensionDescription } from '../../../services/extensions/common/extensions.js';

suite('Extension', () => {

	ensureNoDisposablesAreLeakedInTestSuite();

	const mockExtensionService: IExtHostExtensionService = {
		isActivated(_extensionId: ExtensionIdentifier): boolean {
			return false;
		}
	} as IExtHostExtensionService;

	function createExtensionDescription(id: string, location: URI): IExtensionDescription {
		return {
			...nullExtensionDescription,
			identifier: new ExtensionIdentifier(id),
			extensionLocation: location,
		};
	}

	test('extensionKind is UI for local extensions from different host', () => {
		const desc = createExtensionDescription('vscode.bat', URI.parse('vscode-local:/usr/share/code-insiders/resources/app/extensions/bat'));
		const ext = new Extension(mockExtensionService, nullExtensionDescription.identifier, desc, ExtensionKind.UI, true);
		assert.strictEqual(ext.extensionKind, ExtensionKind.UI);
	});

	test('extensionKind is Workspace for remote extensions from different host', () => {
		const desc = createExtensionDescription('vscode.bat', URI.parse('file:///home/user/.vscode-server/extensions/bat'));
		const ext = new Extension(mockExtensionService, nullExtensionDescription.identifier, desc, ExtensionKind.Workspace, true);
		assert.strictEqual(ext.extensionKind, ExtensionKind.Workspace);
	});

	test('extensionKind reflects the host kind for own extensions', () => {
		const desc = createExtensionDescription('vscode.bat', URI.parse('file:///home/user/.vscode-server/extensions/bat'));
		const ext = new Extension(mockExtensionService, nullExtensionDescription.identifier, desc, ExtensionKind.Workspace, false);
		assert.strictEqual(ext.extensionKind, ExtensionKind.Workspace);
	});
});
