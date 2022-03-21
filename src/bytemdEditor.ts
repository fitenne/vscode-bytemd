import * as vscode from 'vscode';
import { getHtmlTemplateForWebView } from './view/template.html';

export class BytemdEditorProvider implements vscode.CustomTextEditorProvider {
    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        vscode.commands.registerCommand('bytemd.open', (uri?: vscode.Uri) => {
            let url = uri;
            if (!url) {
                url = vscode.window.activeTextEditor?.document.uri;
            }
            if (!url) {
                console.error('Cannot get url');
                return;
            }

            vscode.commands.executeCommand('vscode.openWith', url, BytemdEditorProvider.viewType);
        });
        vscode.commands.registerCommand('extension.bytemd.bold', () => {});
        vscode.commands.registerCommand('extension.bytemd.italic', () => {});
        vscode.commands.registerCommand('extension.bytemd.link', () => {});
        vscode.commands.registerCommand('extension.bytemd.code', () => {});
        vscode.commands.registerCommand('extension.bytemd.codeblock', () => {});
        vscode.commands.registerCommand('extension.bytemd.unorderedlist', () => {});
        vscode.commands.registerCommand('extension.bytemd.orderedlist', () => {});

        const provider = new BytemdEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(
            BytemdEditorProvider.viewType,
            provider,
        );
        return providerRegistration;
    }

    public static readonly viewType = 'fitenne.bytemd';

    constructor(private readonly context: vscode.ExtensionContext) {}

    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken,
    ): Promise<void> {
        webviewPanel.webview.options = { enableScripts: true };
        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

        const updateWebview = () => {
            const text = document.getText();
            webviewPanel.webview.postMessage({
                type: 'update',
                text,
            });
        };

        // document -> bytemd
        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument((e) => {
            if (e.document.uri.toString() === document.uri.toString()) {
                updateWebview();
            }
        });
        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });

        // bytemd -> document
        webviewPanel.webview.onDidReceiveMessage((e) => {
            switch (e.type) {
                case 'client-update':
                    const nextMarkdown = e.content;
                    this.updateDocument(document, nextMarkdown);
                    return;
            }
        });

        // status restore
        const changeWindowState = vscode.window.onDidChangeWindowState((e) => {
            console.log(`DidChangeWindowState: ${e.focused}`);
            webviewPanel.webview.postMessage({
                type: 'status',
                focused: e.focused
            });
        });
        webviewPanel.onDidDispose(() => {
            changeWindowState.dispose();
        });
        
        updateWebview();
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        return getHtmlTemplateForWebView(webview, this.context.extensionUri);
    }

    private updateDocument(document: vscode.TextDocument, nextMarkdown: string) {
        const text = document.getText();
        if (text === nextMarkdown) {
            return;   
        }

        const edit = new vscode.WorkspaceEdit();
        edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), nextMarkdown);
        vscode.workspace.applyEdit(edit);
    }
}