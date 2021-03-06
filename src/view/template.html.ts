import * as vscode from 'vscode';
import { getNonce } from './util';

export const getHtmlTemplateForWebView = (webview: vscode.Webview, extensionUri: vscode.Uri) => {
	const getMediaUri = (fileName: string) =>
		webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', fileName));

	const scriptUri = getMediaUri('view.js');
	const styleUri = getMediaUri('style.css');
	const nonce = getNonce();

	return /* html */ `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
				Use a content security policy to only allow loading images from https or from our extension directory,
				and only allow scripts that have a specific nonce.
				-->
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: http:; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; font-src ${webview.cspSource}">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>bytemd</title>
                <link href="${styleUri}" rel="stylesheet" />
			</head>
			<body>
                <div id="app"></div>

                <script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
};
