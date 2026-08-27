import * as vscode from 'vscode';
import { Ollama } from 'ollama';
import { getWebViewContent } from './webviewContent';

export function activate(context: vscode.ExtensionContext) {
    console.log("Ollama VS Code extension is active!");

    // Instantiate our Sidebar view provider
    const provider = new OllamaSidebarProvider(context);

    // Register WebviewViewProvider
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            OllamaSidebarProvider.viewType,
            provider
        )
    );

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('ollama-vscode-chat.start', () => {
            vscode.commands.executeCommand('workbench.view.extension.ollama-sidebar-container');
            provider.focus();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('ollama-vscode-chat.focusSidebar', () => {
            vscode.commands.executeCommand('workbench.view.extension.ollama-sidebar-container');
            provider.focus();
        })
    );

    // Context menu code actions helper
    const registerCodeActionCommand = (commandId: string, action: string) => {
        return vscode.commands.registerCommand(commandId, async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('Open an editor and select code first.');
                return;
            }

            const selection = editor.selection;
            const text = editor.document.getText(selection);

            if (!text.trim()) {
                vscode.window.showWarningMessage('Please select some code to analyze.');
                return;
            }

            // Bring sidebar container to focus and focus the view
            await vscode.commands.executeCommand('workbench.view.extension.ollama-sidebar-container');
            provider.focus();

            // Give the webview a brief moment to load and register the message listener if it was just loaded
            setTimeout(() => {
                provider.triggerContextCommand(action, text);
            }, 300);
        });
    };

    context.subscriptions.push(registerCodeActionCommand('ollama-vscode-chat.explainCode', 'explain'));
    context.subscriptions.push(registerCodeActionCommand('ollama-vscode-chat.findBugs', 'bugs'));
    context.subscriptions.push(registerCodeActionCommand('ollama-vscode-chat.generateTests', 'tests'));
    context.subscriptions.push(registerCodeActionCommand('ollama-vscode-chat.documentCode', 'document'));
}

class OllamaSidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'ollama.chatView';
    private _view?: vscode.WebviewView;

    constructor(private readonly _context: vscode.ExtensionContext) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._context.extensionUri]
        };

        // Load the HTML content
        webviewView.webview.html = getWebViewContent(this._context.extensionUri, webviewView.webview);

        // Set up Webview message listener
        webviewView.webview.onDidReceiveMessage(async (message) => {
            // Retrieve latest API settings
            const config = vscode.workspace.getConfiguration('ollama');
            const apiUrl = config.get<string>('apiUrl') || 'http://localhost:11434';
            const client = new Ollama({ host: apiUrl });

            switch (message.command) {
                case 'checkConnection':
                    try {
                        await client.list();
                        this.postMessage({ command: 'connectionStatus', status: 'online' });
                    } catch (err) {
                        this.postMessage({ command: 'connectionStatus', status: 'offline', error: String(err) });
                    }
                    break;

                case 'getSettings':
                    this.postMessage({
                        command: 'loadSettings',
                        settings: {
                            systemPrompt: config.get<string>('systemPrompt'),
                            temperature: config.get<number>('temperature'),
                            contextLength: config.get<number>('contextLength')
                        }
                    });
                    break;

                case 'saveSettings':
                    if (message.settings) {
                        await config.update('systemPrompt', message.settings.systemPrompt, vscode.ConfigurationTarget.Global);
                        await config.update('temperature', message.settings.temperature, vscode.ConfigurationTarget.Global);
                        await config.update('contextLength', message.settings.contextLength, vscode.ConfigurationTarget.Global);
                    }
                    break;

                case 'getModels':
                    try {
                        const response = await client.list();
                        this.postMessage({ command: 'modelsList', models: response.models });
                    } catch (err) {
                        this.postMessage({ command: 'modelsError', error: String(err) });
                    }
                    break;

                case 'deleteModel':
                    try {
                        await client.delete({ model: message.model });
                        const response = await client.list();
                        this.postMessage({ command: 'modelsList', models: response.models });
                        vscode.window.showInformationMessage(`Deleted model: ${message.model}`);
                    } catch (err) {
                        vscode.window.showErrorMessage(`Failed to delete model: ${err}`);
                    }
                    break;

                case 'pullModel':
                    try {
                        vscode.window.showInformationMessage(`Starting pull for model: ${message.model}`);
                        const pullStream = await client.pull({ model: message.model, stream: true });
                        
                        for await (const part of pullStream) {
                            this.postMessage({
                                command: 'pullProgress',
                                model: message.model,
                                status: part.status,
                                completed: part.completed,
                                total: part.total
                            });
                        }
                        this.postMessage({ command: 'pullComplete', model: message.model });
                    } catch (err) {
                        this.postMessage({ command: 'pullError', model: message.model, error: String(err) });
                        vscode.window.showErrorMessage(`Pull failed: ${err}`);
                    }
                    break;

                case 'chat': {
                    const { text, model, history, systemPrompt, temperature, contextLength } = message;
                    const responseId = Date.now();

                    // Tell webview that streaming is starting
                    this.postMessage({ command: 'startStream', id: responseId, text: `${model} is processing...` });

                    try {
                        // Merge system prompt into messages if present
                        const formattedMessages: any[] = [];
                        if (systemPrompt && systemPrompt.trim()) {
                            formattedMessages.push({ role: 'system', content: systemPrompt });
                        }

                        // Add history context
                        if (history && history.length > 0) {
                            formattedMessages.push(...history);
                        }

                        // Add the final user query
                        formattedMessages.push({ role: 'user', content: text });

                        const responseStream = await client.chat({
                            model: model,
                            messages: formattedMessages,
                            options: {
                                temperature: temperature ?? 0.7,
                                num_ctx: contextLength ?? 4096
                            },
                            stream: true
                        });

                        let responseAccumulator = "";
                        let stats: any = {};
                        for await (const chunk of responseStream) {
                            if (chunk.message?.content) {
                                responseAccumulator += chunk.message.content;
                                this.postMessage({ command: 'updateStream', id: responseId, text: responseAccumulator });
                            }
                            if (chunk.total_duration || (chunk as any).eval_count) {
                                stats = {
                                    totalDuration: chunk.total_duration,
                                    loadDuration: chunk.load_duration,
                                    promptEvalCount: chunk.prompt_eval_count,
                                    evalCount: chunk.eval_count,
                                    evalDuration: chunk.eval_duration
                                };
                            }
                        }

                        this.postMessage({ command: 'streamComplete', id: responseId, text: responseAccumulator, stats });
                    } catch (err) {
                        console.error('Chat error:', err);
                        this.postMessage({ command: 'updateStream', id: responseId, text: `Error generating response: ${String(err)}` });
                        this.postMessage({ command: 'streamComplete', id: responseId, text: `Error: ${String(err)}` });
                    }
                    break;
                }

                case 'insertCode': {
                    const editor = vscode.window.activeTextEditor;
                    if (editor) {
                        editor.edit((editBuilder) => {
                            // Insert code at current cursor position
                            editBuilder.insert(editor.selection.active, message.code);
                        });
                    } else {
                        vscode.window.showErrorMessage('No active text editor found to insert code.');
                    }
                    break;
                }

                case 'copyToClipboard':
                    await vscode.env.clipboard.writeText(message.text);
                    break;

                case 'saveChatHistory':
                    this._context.workspaceState.update('chatHistory', message.history);
                    break;

                case 'loadChatHistory':
                    const savedHistory = this._context.workspaceState.get('chatHistory') || [];
                    this.postMessage({ command: 'loadChatHistoryResponse', history: savedHistory });
                    break;
            }
        });
    }

    public focus() {
        if (this._view) {
            this._view.show(true);
        }
    }

    public triggerContextCommand(action: string, code: string) {
        this.postMessage({
            command: 'triggerCommand',
            action,
            code
        });
    }

    private postMessage(message: any) {
        if (this._view) {
            this._view.webview.postMessage(message);
        }
    }
}

export function deactivate() {}
