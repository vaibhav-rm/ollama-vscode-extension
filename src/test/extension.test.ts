import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Ollama Extension Test Suite', () => {
    vscode.window.showInformationMessage('Running Ollama Extension Tests...');

    test('Extension should be present', () => {
        const extension = vscode.extensions.getExtension('Vaibhavrathod.ollama-vscode-chat');
        assert.ok(extension, 'Extension should be registered in VS Code');
    });

    test('All commands should be registered', async () => {
        const extension = vscode.extensions.getExtension('Vaibhavrathod.ollama-vscode-chat');
        assert.ok(extension, 'Extension should be registered in VS Code');
        if (!extension.isActive) {
            await extension.activate();
        }
        const commands = await vscode.commands.getCommands(true);
        const expectedCommands = [
            'ollama-vscode-chat.start',
            'ollama-vscode-chat.focusSidebar',
            'ollama-vscode-chat.explainCode',
            'ollama-vscode-chat.findBugs',
            'ollama-vscode-chat.generateTests',
            'ollama-vscode-chat.documentCode'
        ];
        
        for (const cmd of expectedCommands) {
            assert.ok(commands.includes(cmd), `Command ${cmd} should be registered upon activation`);
        }
    });
});
