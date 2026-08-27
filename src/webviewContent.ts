import * as vscode from 'vscode';

export function getWebViewContent(extensionUri: vscode.Uri, webview: vscode.Webview): string {
    return /*html*/`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ollama Chat</title>
        
        <!-- Google Fonts -->
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        </style>
        
        <!-- PrismJS CSS for beautiful syntax highlighting -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" />
        
        <style>
            /* Custom CSS variables that integrate seamlessly with VS Code themes */
            :root {
                --primary-gradient: linear-gradient(135deg, #007acc 0%, #005f99 100%);
                --accent-gradient: linear-gradient(135deg, #4ec9b0 0%, #007acc 100%);
                --danger-gradient: linear-gradient(135deg, #f44747 0%, #d13438 100%);
                --glass-bg: rgba(30, 30, 30, 0.3);
                
                /* VS Code mappings with fallbacks */
                --bg-color: var(--vscode-editor-background, #1e1e1e);
                --text-color: var(--vscode-editor-foreground, #cccccc);
                --input-bg: var(--vscode-input-background, #252526);
                --input-fg: var(--vscode-input-foreground, #cccccc);
                --input-border: var(--vscode-input-border, #3c3c3c);
                --btn-bg: var(--vscode-button-background, #007acc);
                --btn-fg: var(--vscode-button-foreground, #ffffff);
                --btn-hover: var(--vscode-button-hoverBackground, #0062a3);
                --border-color: var(--vscode-panel-border, #3c3c3c);
                --card-bg: var(--vscode-editor-inactiveSelectionBackground, rgba(60, 60, 60, 0.2));
            }

            body { 
                font-family: 'Plus Jakarta Sans', var(--vscode-editor-font-family), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                background-color: var(--bg-color); 
                color: var(--text-color); 
                margin: 0; 
                padding: 0; 
                display: flex;
                flex-direction: column;
                height: 100vh;
                overflow: hidden;
            }

            /* Premium Layout Structure */
            .navbar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px 14px;
                border-bottom: 1px solid var(--border-color);
                background-color: rgba(0, 0, 0, 0.15);
                flex-shrink: 0;
            }

            .nav-tabs {
                display: flex;
                gap: 4px;
            }

            .tab-btn {
                background: transparent;
                border: none;
                color: var(--text-color);
                opacity: 0.6;
                padding: 6px 12px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                border-radius: 6px;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .tab-btn:hover {
                opacity: 0.9;
                background-color: rgba(255, 255, 255, 0.05);
            }

            .tab-btn.active {
                opacity: 1;
                background-color: rgba(255, 255, 255, 0.1);
                box-shadow: inset 0 -2px 0 var(--vscode-button-background);
            }

            .connection-status {
                display: flex;
                align-items: center;
                font-size: 11px;
                font-weight: 500;
                opacity: 0.8;
            }

            .status-dot {
                width: 7px;
                height: 7px;
                border-radius: 50%;
                margin-right: 6px;
                display: inline-block;
            }

            .status-dot.online {
                background-color: #4ec9b0;
                box-shadow: 0 0 8px rgba(78, 201, 176, 0.6);
                animation: pulse 2.5s infinite;
            }

            .status-dot.offline {
                background-color: #f44747;
                box-shadow: 0 0 8px rgba(244, 71, 71, 0.6);
            }

            @keyframes pulse {
                0% { transform: scale(0.92); box-shadow: 0 0 0 0 rgba(78, 201, 176, 0.5); }
                70% { transform: scale(1.08); box-shadow: 0 0 0 5px rgba(78, 201, 176, 0); }
                100% { transform: scale(0.92); box-shadow: 0 0 0 0 rgba(78, 201, 176, 0); }
            }

            /* View Containers */
            .view-content {
                flex-grow: 1;
                overflow: hidden;
                position: relative;
                display: flex;
                flex-direction: column;
            }

            .tab-panel {
                display: none;
                flex-direction: column;
                height: 100%;
                overflow: hidden;
            }

            .tab-panel.active {
                display: flex;
            }

            /* Chat Tab Styles */
            .chat-header {
                padding: 10px 14px;
                display: flex;
                flex-direction: column;
                gap: 8px;
                border-bottom: 1px solid var(--border-color);
                background-color: rgba(0, 0, 0, 0.05);
            }

            .control-row {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            .model-select {
                flex: 1;
                min-width: 0;
                padding: 6px 10px;
                border-radius: 6px;
                background-color: var(--input-bg);
                color: var(--input-fg);
                border: 1px solid var(--input-border);
                font-size: 12px;
                outline: none;
                cursor: pointer;
            }

            .icon-btn {
                background: transparent;
                border: 1px solid var(--border-color);
                color: var(--text-color);
                border-radius: 6px;
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s;
                flex-shrink: 0;
            }

            .icon-btn:hover {
                background-color: rgba(255, 255, 255, 0.08);
                border-color: var(--vscode-button-background);
            }

            /* Settings Parameters Drawer */
            .settings-drawer {
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                background-color: rgba(0, 0, 0, 0.1);
                border-radius: 6px;
            }

            .settings-drawer.open {
                max-height: 350px;
                border: 1px solid var(--border-color);
                margin-top: 4px;
                padding: 12px;
            }

            .settings-field {
                margin-bottom: 10px;
            }

            .settings-field:last-child {
                margin-bottom: 0;
            }

            .settings-label {
                display: flex;
                justify-content: space-between;
                font-size: 11px;
                font-weight: 600;
                margin-bottom: 4px;
                opacity: 0.8;
            }

            .settings-input {
                width: 100%;
                padding: 6px 8px;
                border-radius: 4px;
                background-color: var(--input-bg);
                color: var(--input-fg);
                border: 1px solid var(--input-border);
                font-size: 11px;
                box-sizing: border-box;
            }

            .settings-range-container {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .settings-range {
                flex-grow: 1;
                accent-color: var(--vscode-button-background);
                cursor: pointer;
            }

            /* Message Area */
            .messages-container {
                flex-grow: 1;
                overflow-y: auto;
                padding: 14px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .message-wrapper {
                display: flex;
                flex-direction: column;
                max-width: 88%;
                animation: slideIn 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }

            @keyframes slideIn {
                from { opacity: 0; transform: translateY(8px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .message-wrapper.user {
                align-self: flex-end;
            }

            .message-wrapper.ai {
                align-self: flex-start;
            }

            .message-sender {
                font-size: 10px;
                font-weight: 700;
                opacity: 0.5;
                margin-bottom: 4px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .message-wrapper.user .message-sender {
                text-align: right;
            }

            .message-bubble {
                padding: 10px 14px;
                border-radius: 12px;
                font-size: 13px;
                line-height: 1.5;
                word-break: break-word;
            }

            .message-wrapper.user .message-bubble {
                background: var(--primary-gradient);
                color: var(--btn-fg);
                border-bottom-right-radius: 2px;
                box-shadow: 0 2px 8px rgba(0, 122, 204, 0.2);
            }

            .message-wrapper.ai .message-bubble {
                background-color: var(--card-bg);
                color: var(--text-color);
                border-bottom-left-radius: 2px;
                border: 1px solid var(--border-color);
            }

            /* Formatting inside bubbles */
            .message-bubble p {
                margin: 0 0 8px 0;
            }

            .message-bubble p:last-child {
                margin-bottom: 0;
            }

            .message-bubble ul, .message-bubble ol {
                margin: 0 0 8px 0;
                padding-left: 20px;
            }

            .message-bubble li {
                margin-bottom: 4px;
            }

            /* Code Snippet Styles */
            .code-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background-color: #2d2d2d;
                border-top-left-radius: 6px;
                border-top-right-radius: 6px;
                padding: 4px 10px;
                font-size: 11px;
                font-family: var(--vscode-editor-font-family, monospace);
                color: #b5cea8;
                border-bottom: 1px solid #3c3c3c;
                margin-top: 8px;
            }

            .code-actions {
                display: flex;
                gap: 6px;
            }

            .code-btn {
                background: transparent;
                border: none;
                color: #cccccc;
                cursor: pointer;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 10px;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 3px;
            }

            .code-btn:hover {
                background-color: rgba(255, 255, 255, 0.1);
                color: #ffffff;
            }

            .message-bubble pre {
                margin: 0 0 10px 0;
                border-bottom-left-radius: 6px;
                border-bottom-right-radius: 6px;
                border-top-left-radius: 0;
                border-top-right-radius: 0;
                padding: 10px;
                overflow-x: auto;
                background-color: #1e1e1e !important;
                border: 1px solid #2d2d2d;
                border-top: none;
            }

            .message-bubble pre code {
                font-family: var(--vscode-editor-font-family, 'Courier New', Courier, monospace) !important;
                font-size: 12px !important;
                background: transparent !important;
                padding: 0 !important;
                border-radius: 0 !important;
            }

            .message-bubble :not(pre) > code {
                background-color: rgba(255, 255, 255, 0.1);
                padding: 2px 4px;
                border-radius: 4px;
                font-family: var(--vscode-editor-font-family, monospace);
                font-size: 12px;
            }

            /* Response Performance Metrics */
            .message-stats {
                font-size: 10px;
                opacity: 0.55;
                margin-top: 6px;
                padding-top: 6px;
                border-top: 1px dashed rgba(255, 255, 255, 0.15);
                display: flex;
                gap: 8px;
                justify-content: flex-end;
                font-family: var(--vscode-editor-font-family, monospace);
            }



            /* Floating Input Container */
            .input-container {
                padding: 10px 14px 16px 14px;
                border-top: 1px solid var(--border-color);
                background-color: rgba(0, 0, 0, 0.1);
                display: flex;
                gap: 8px;
                align-items: flex-end;
                flex-shrink: 0;
            }

            .textarea-wrapper {
                flex-grow: 1;
                position: relative;
                background-color: var(--input-bg);
                border: 1px solid var(--input-border);
                border-radius: 10px;
                padding: 2px;
                transition: border-color 0.2s;
            }

            .textarea-wrapper:focus-within {
                border-color: var(--vscode-button-background);
            }

            .chat-input {
                width: 100%;
                border: none;
                background: transparent;
                color: var(--input-fg);
                font-size: 13px;
                font-family: inherit;
                resize: none;
                padding: 8px 10px;
                outline: none;
                max-height: 120px;
                box-sizing: border-box;
                display: block;
            }

            .send-btn {
                background: var(--primary-gradient);
                color: var(--btn-fg);
                border: none;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s;
                flex-shrink: 0;
                margin-bottom: 2px;
                box-shadow: 0 2px 6px rgba(0, 122, 204, 0.3);
            }

            .send-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 3px 8px rgba(0, 122, 204, 0.5);
            }

            .send-btn:disabled {
                background: var(--border-color);
                color: var(--text-color);
                opacity: 0.4;
                cursor: not-allowed;
                box-shadow: none;
                transform: none;
            }

            /* Models Tab Layout */
            .models-panel {
                padding: 14px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 16px;
                height: 100%;
                box-sizing: border-box;
            }

            .section-title {
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                opacity: 0.7;
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .pull-form {
                display: flex;
                gap: 8px;
            }

            .pull-input {
                flex-grow: 1;
                padding: 8px 10px;
                border-radius: 6px;
                background-color: var(--input-bg);
                color: var(--input-fg);
                border: 1px solid var(--input-border);
                font-size: 12px;
                outline: none;
            }

            .pull-input:focus {
                border-color: var(--vscode-button-background);
            }

            .pull-btn {
                background: var(--primary-gradient);
                color: var(--btn-fg);
                border: none;
                border-radius: 6px;
                padding: 8px 14px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: background-color 0.2s;
            }

            .pull-btn:hover {
                filter: brightness(1.1);
            }

            /* Progress Dashboard */
            .progress-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .progress-card {
                background-color: var(--card-bg);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                padding: 10px 12px;
                animation: slideIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .progress-info {
                display: flex;
                justify-content: space-between;
                font-size: 11px;
                margin-bottom: 6px;
                font-weight: 500;
            }

            .progress-bar-bg {
                background-color: rgba(255, 255, 255, 0.08);
                height: 6px;
                border-radius: 3px;
                overflow: hidden;
                position: relative;
            }

            .progress-bar-fill {
                background: var(--accent-gradient);
                height: 100%;
                width: 0%;
                border-radius: 3px;
                transition: width 0.3s ease;
            }

            .progress-status {
                font-size: 10px;
                opacity: 0.6;
                margin-top: 4px;
                text-transform: capitalize;
            }

            /* Model Cards */
            .models-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .model-card {
                background-color: var(--card-bg);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                padding: 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .model-card:hover {
                border-color: rgba(0, 122, 204, 0.4);
                transform: translateX(2px);
            }

            .model-details {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .model-name {
                font-size: 13px;
                font-weight: 600;
                color: var(--vscode-editor-foreground);
            }

            .badge-row {
                display: flex;
                gap: 4px;
                flex-wrap: wrap;
            }

            .badge {
                font-size: 9px;
                font-weight: 700;
                padding: 2px 6px;
                border-radius: 4px;
                background-color: rgba(255, 255, 255, 0.08);
                opacity: 0.7;
                text-transform: uppercase;
            }

            .badge.param {
                background-color: rgba(0, 122, 204, 0.12);
                color: #569cd6;
                opacity: 1;
            }

            .delete-btn {
                background: transparent;
                border: none;
                color: var(--text-color);
                opacity: 0.5;
                cursor: pointer;
                padding: 6px;
                border-radius: 6px;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .delete-btn:hover {
                background-color: rgba(244, 71, 71, 0.12);
                color: #f44747;
                opacity: 1;
            }

            /* Scrollbars */
            ::-webkit-scrollbar {
                width: 6px;
            }
            ::-webkit-scrollbar-track {
                background: transparent;
            }
            ::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
            }
            ::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.2);
            }
        </style>
    </head>
    <body>
        <!-- Header / Navigation -->
        <div class="navbar">
            <div class="nav-tabs">
                <button class="tab-btn active" onclick="switchTab('chat-tab')">Chat</button>
                <button class="tab-btn" onclick="switchTab('models-tab')">Models</button>
            </div>
            <div class="connection-status">
                <span id="statusDot" class="status-dot offline"></span>
                <span id="statusText">Checking...</span>
            </div>
        </div>

        <div class="view-content">
            <!-- CHAT PANEL -->
            <div id="chat-tab" class="tab-panel active">
                <div class="chat-header">
                    <div class="control-row">
                        <select id="modelSelect" class="model-select" onchange="onModelChanged()">
                            <option value="">No models available</option>
                        </select>
                        <button class="icon-btn" onclick="toggleSettings()" title="Advanced Settings">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                        </button>
                        <button class="icon-btn" onclick="clearChat()" title="Start New Chat">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 5v14M5 12h14"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Settings Accordion -->
                    <div id="settingsDrawer" class="settings-drawer">
                        <div class="settings-field">
                            <div class="settings-label">
                                <span>System Prompt</span>
                            </div>
                            <textarea id="sysPromptInput" rows="3" class="settings-input" placeholder="e.g. You are an expert TypeScript assistant..." onchange="saveParameters()"></textarea>
                        </div>
                        <div class="settings-field">
                            <div class="settings-label">
                                <span>Temperature</span>
                                <span id="tempValue">0.7</span>
                            </div>
                            <div class="settings-range-container">
                                <input type="range" id="tempInput" class="settings-range" min="0" max="1" step="0.1" value="0.7" oninput="updateTempVal()" onchange="saveParameters()" />
                            </div>
                        </div>
                        <div class="settings-field">
                            <div class="settings-label">
                                <span>Context Window size</span>
                            </div>
                            <input type="number" id="contextInput" class="settings-input" value="4096" placeholder="4096" onchange="saveParameters()" />
                        </div>
                    </div>
                </div>

                <!-- Messages -->
                <div id="response" class="messages-container">
                    <div class="message-wrapper ai">
                        <span class="message-sender">Assistant</span>
                        <div class="message-bubble">
                            <p>Hello! I am your local Ollama coding assistant. Select a model above and ask me anything, or right-click some code in your editor to analyze it!</p>
                        </div>
                    </div>
                </div>

                <!-- Input area -->
                <div class="input-container">
                    <div class="textarea-wrapper">
                        <textarea id="prompt" class="chat-input" rows="1" placeholder="Type a message..." onkeydown="handleKeyDown(event)" oninput="autoGrow(this)"></textarea>
                    </div>
                    <button id="askBtn" class="send-btn" onclick="sendMessage()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- MODELS PANEL -->
            <div id="models-tab" class="tab-panel">
                <div class="models-panel">
                    <!-- Pull new model -->
                    <div>
                        <div class="section-title">Download New Model</div>
                        <div class="pull-form">
                            <input type="text" id="pullModelInput" class="pull-input" placeholder="e.g. deepseek-r1:8b" />
                            <button id="pullBtn" class="pull-btn" onclick="pullModel()">Pull</button>
                        </div>
                    </div>

                    <!-- Progress Tracking -->
                    <div id="progressList" class="progress-list"></div>

                    <!-- Installed models -->
                    <div>
                        <div class="section-title">
                            <span>Installed Models</span>
                            <span onclick="refreshModels()" style="cursor:pointer; opacity:0.8; text-transform:none; font-size:10px; font-weight:normal; display:flex; align-items:center; gap:3px;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                                </svg> Refresh
                            </span>
                        </div>
                        <div id="modelsList" class="models-list">
                            <div style="text-align:center; padding:20px; opacity:0.5; font-size:12px;">Loading models...</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- JS Dependencies -->
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>

        <script>
            const vscode = acquireVsCodeApi();
            
            // App State
            let chatHistory = [];
            let currentModel = "";
            let isGenerating = false;
            let currentSettings = {
                systemPrompt: "You are a helpful, expert AI software developer. Provide clear, correct, and well-structured code explanations and modifications.",
                temperature: 0.7,
                contextLength: 4096
            };

            // Initialize Page
            window.addEventListener('DOMContentLoaded', () => {
                // Request settings and model list
                vscode.postMessage({ command: 'getSettings' });
                vscode.postMessage({ command: 'getModels' });
                vscode.postMessage({ command: 'checkConnection' });
                vscode.postMessage({ command: 'loadChatHistory' });
                
                // Set default marked options if loaded
                if (typeof marked !== 'undefined') {
                    marked.setOptions({
                        breaks: true,
                        gfm: true
                    });
                }
            });

            // Handle Messages from Extension
            window.addEventListener('message', event => {
                const message = event.data;
                
                switch (message.command) {
                    case 'connectionStatus':
                        const statusDot = document.getElementById('statusDot');
                        const statusText = document.getElementById('statusText');
                        if (message.status === 'online') {
                            statusDot.className = 'status-dot online';
                            statusText.textContent = 'Connected';
                        } else {
                            statusDot.className = 'status-dot offline';
                            statusText.textContent = 'Disconnected';
                        }
                        break;

                    case 'loadSettings':
                        if (message.settings) {
                            currentSettings = message.settings;
                            document.getElementById('sysPromptInput').value = currentSettings.systemPrompt || '';
                            document.getElementById('tempInput').value = currentSettings.temperature || 0.7;
                            document.getElementById('tempValue').textContent = currentSettings.temperature || 0.7;
                            document.getElementById('contextInput').value = currentSettings.contextLength || 4096;
                        }
                        break;

                    case 'modelsList':
                        populateModelsDropdown(message.models);
                        renderInstalledModels(message.models);
                        break;

                    case 'modelsError':
                        const modelsList = document.getElementById('modelsList');
                        modelsList.innerHTML = \`<div style="color:var(--vscode-errorForeground); padding:10px; font-size:11px; text-align:center;">Failed to list models. Is Ollama running?</div>\`;
                        break;

                    case 'loadChatHistoryResponse':
                        if (message.history && message.history.length > 0) {
                            chatHistory = message.history;
                            rebuildChatUI();
                        }
                        break;

                    case 'startStream':
                        isGenerating = true;
                        setSendBtnLoading(true);
                        appendAIMessagePlaceholder(message.id, message.text);
                        break;

                    case 'updateStream':
                        updateAIMessage(message.id, message.text);
                        break;

                    case 'streamComplete':
                        isGenerating = false;
                        setSendBtnLoading(false);
                        
                        // Render stats in bubble
                        if (message.stats) {
                            renderMessageStats(message.id, message.stats);
                        }

                        // Save chat completion to state
                        chatHistory.push({ role: 'assistant', content: message.text, stats: message.stats });
                        vscode.postMessage({ command: 'saveChatHistory', history: chatHistory });
                        break;

                    case 'pullProgress':
                        updatePullProgress(message.model, message.status, message.completed, message.total);
                        break;

                    case 'pullComplete':
                        removePullProgress(message.model);
                        vscode.postMessage({ command: 'getModels' });
                        alert('Model downloaded successfully: ' + message.model);
                        break;

                    case 'pullError':
                        removePullProgress(message.model);
                        alert('Error pulling model ' + message.model + ': ' + message.error);
                        break;

                    case 'triggerCommand':
                        handleContextCommand(message.action, message.code);
                        break;
                }
            });

            // Tab Navigation
            function switchTab(tabId) {
                document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                
                document.getElementById(tabId).classList.add('active');
                event.target.classList.add('active');

                if (tabId === 'models-tab') {
                    vscode.postMessage({ command: 'getModels' });
                } else if (tabId === 'chat-tab') {
                    vscode.postMessage({ command: 'checkConnection' });
                }
            }

            // Settings Drawer Toggle
            function toggleSettings() {
                const drawer = document.getElementById('settingsDrawer');
                drawer.classList.toggle('open');
            }

            function updateTempVal() {
                const val = document.getElementById('tempInput').value;
                document.getElementById('tempValue').textContent = val;
            }

            function saveParameters() {
                currentSettings.systemPrompt = document.getElementById('sysPromptInput').value;
                currentSettings.temperature = parseFloat(document.getElementById('tempInput').value);
                currentSettings.contextLength = parseInt(document.getElementById('contextInput').value) || 4096;
                
                vscode.postMessage({
                    command: 'saveSettings',
                    settings: currentSettings
                });
            }



            // Models Dropdown & Installed Lists
            function populateModelsDropdown(models) {
                const dropdown = document.getElementById('modelSelect');
                dropdown.innerHTML = "";
                
                if (!models || models.length === 0) {
                    dropdown.innerHTML = '<option value="">No models available</option>';
                    currentModel = "";
                    return;
                }

                models.forEach(m => {
                    const option = document.createElement('option');
                    option.value = m.name;
                    option.textContent = m.name;
                    if (m.name === currentModel) {
                        option.selected = true;
                    }
                    dropdown.appendChild(option);
                });

                if (!currentModel && models.length > 0) {
                    currentModel = models[0].name;
                    dropdown.value = currentModel;
                }
            }

            // Render Markdown & Escape helper
            function parseMarkdown(text) {
                if (typeof marked !== 'undefined') {
                    // Inject code snippet action headers on code blocks using custom marked renderer
                    const renderer = new marked.Renderer();
                    
                    renderer.code = function(code, language, isEscaped) {
                        const codeStr = typeof code === 'object' ? code.text : code;
                        const lang = language || 'plaintext';
                        
                        // Escape single/double quotes for JS parameter safety
                        const escapedCode = codeStr
                            .replace(/\\\\/g, '\\\\\\\\')
                            .replace(/'/g, "\\\\'")
                            .replace(/"/g, '\\\\"')
                            .replace(/\\n/g, '\\\\n')
                            .replace(/\\r/g, '\\\\r');

                        return \`
                            <div class="code-header">
                                <span>\${lang.toUpperCase()}</span>
                                <div class="code-actions">
                                    <button class="code-btn" onclick="copyCode('\${escapedCode}', this)">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy
                                    </button>
                                    <button class="code-btn" onclick="insertCode('\${escapedCode}')">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg> Insert
                                    </button>
                                </div>
                            </div>
                            <pre><code class="language-\${lang}">\${escapeHtml(codeStr)}</code></pre>
                        \`;
                    };
                    
                    return marked.parse(text, { renderer });
                }

                // Fallback Simple Parser
                let html = text
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;");
                
                // Code blocks fallback
                html = html.replace(/\`\`\`(\\w*)\\n([\\s\\S]*?)\`\`\`/g, (match, lang, code) => {
                    const codeStr = code.trim();
                    const escapedCode = codeStr
                        .replace(/\\\\/g, '\\\\\\\\')
                        .replace(/'/g, "\\\\'")
                        .replace(/"/g, '\\\\"')
                        .replace(/\\n/g, '\\\\n');
                    return \`
                        <div class="code-header">
                            <span>\${(lang || 'code').toUpperCase()}</span>
                            <div class="code-actions">
                                <button class="code-btn" onclick="copyCode('\${escapedCode}', this)">Copy</button>
                                <button class="code-btn" onclick="insertCode('\${escapedCode}')">Insert</button>
                            </div>
                        </div>
                        <pre><code class="language-\${lang || 'plaintext'}">\${codeStr}</code></pre>
                    \`;
                });
                
                // Inline code fallback
                html = html.replace(/\`([^\`]+)\`/g, '<code>$1</code>');
                
                // Line breaks / Paragraphs fallback
                return html.split('\\n').map(line => {
                    if (line.startsWith('# ')) return \`<h3>\${line.slice(2)}</h3>\`;
                    if (line.startsWith('## ')) return \`<h4>\${line.slice(3)}</h4>\`;
                    if (line.startsWith('- ')) return \`<li>\${line.slice(2)}</li>\`;
                    return line ? \`<p>\${line}</p>\` : '';
                }).join('');
            }

            function escapeHtml(unsafe) {
                return unsafe
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            }

            // Copy and Insert Actions
            function copyCode(codeText, buttonElement) {
                vscode.postMessage({ command: 'copyToClipboard', text: codeText });
                
                // Visual confirmation
                const originalText = buttonElement.innerHTML;
                buttonElement.innerHTML = \`<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4ec9b0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!\`;
                setTimeout(() => {
                    buttonElement.innerHTML = originalText;
                }, 2000);
            }

            function insertCode(codeText) {
                vscode.postMessage({ command: 'insertCode', code: codeText });
            }

            // Append Messages to UI
            function appendMessage(text, type, stats = null) {
                const responseBox = document.getElementById('response');
                const wrapper = document.createElement('div');
                wrapper.className = \`message-wrapper \${type}\`;
                
                const senderName = type === 'user' ? 'You' : 'Assistant';
                
                wrapper.innerHTML = \`
                    <span class="message-sender">\${senderName}</span>
                    <div class="message-bubble" \${type === 'ai' ? 'id="message-hist-' + Date.now() + '"' : ''}>\${parseMarkdown(text)}</div>
                \`;
                
                responseBox.appendChild(wrapper);
                responseBox.scrollTop = responseBox.scrollHeight;
                
                // Render stats if present
                if (stats && type === 'ai') {
                    const bubble = wrapper.querySelector('.message-bubble');
                    const statsDiv = document.createElement('div');
                    statsDiv.className = 'message-stats';
                    const timeSec = stats.totalDuration ? (stats.totalDuration / 1e9).toFixed(1) + 's' : 'unknown';
                    const evalCount = stats.evalCount || 0;
                    const evalDurationSec = stats.evalDuration ? (stats.evalDuration / 1e9) : 0;
                    const tps = evalDurationSec > 0 ? (evalCount / evalDurationSec).toFixed(1) + ' t/s' : '0 t/s';
                    const promptTok = stats.promptEvalCount || 0;
                    statsDiv.innerHTML = \`<span>\${tps}</span> • <span>\${timeSec} total</span> • <span>\${promptTok} prompt tok</span>\`;
                    bubble.appendChild(statsDiv);
                }

                // Apply syntax highlighting
                if (typeof Prism !== 'undefined') {
                    Prism.highlightAllUnder(wrapper);
                }
            }

            function appendAIMessagePlaceholder(id, text) {
                const responseBox = document.getElementById('response');
                const wrapper = document.createElement('div');
                wrapper.className = 'message-wrapper ai';
                wrapper.id = 'msg-container-' + id;
                
                wrapper.innerHTML = \`
                    <span class="message-sender">Assistant</span>
                    <div class="message-bubble" id="message-\${id}">\${parseMarkdown(text)}</div>
                \`;
                
                responseBox.appendChild(wrapper);
                responseBox.scrollTop = responseBox.scrollHeight;
            }

            function updateAIMessage(id, text) {
                const bubble = document.getElementById('message-' + id);
                if (bubble) {
                    bubble.innerHTML = parseMarkdown(text);
                    
                    // Highlight codes
                    if (typeof Prism !== 'undefined') {
                        Prism.highlightAllUnder(bubble);
                    }
                    
                    const responseBox = document.getElementById('response');
                    responseBox.scrollTop = responseBox.scrollHeight;
                }
            }

            function renderMessageStats(id, stats) {
                const bubble = document.getElementById('message-' + id);
                if (!bubble) return;
                
                // Avoid duplicates
                const existing = bubble.querySelector('.message-stats');
                if (existing) existing.remove();
                
                const statsDiv = document.createElement('div');
                statsDiv.className = 'message-stats';
                
                const timeSec = stats.totalDuration ? (stats.totalDuration / 1e9).toFixed(1) + 's' : 'unknown';
                const evalCount = stats.evalCount || 0;
                const evalDurationSec = stats.evalDuration ? (stats.evalDuration / 1e9) : 0;
                const tps = evalDurationSec > 0 ? (evalCount / evalDurationSec).toFixed(1) + ' t/s' : '0 t/s';
                const promptTok = stats.promptEvalCount || 0;
                
                statsDiv.innerHTML = \`<span>\${tps}</span> • <span>\${timeSec} total</span> • <span>\${promptTok} prompt tok</span>\`;
                bubble.appendChild(statsDiv);
            }

            function rebuildChatUI() {
                const responseBox = document.getElementById('response');
                responseBox.innerHTML = "";
                
                if (chatHistory.length === 0) {
                    responseBox.innerHTML = \`
                        <div class="message-wrapper ai">
                            <span class="message-sender">Assistant</span>
                            <div class="message-bubble">
                                <p>Hello! I am your local Ollama coding assistant. Select a model above and ask me anything, or right-click some code in your editor to analyze it!</p>
                            </div>
                        </div>
                    \`;
                    return;
                }

                chatHistory.forEach((msg, idx) => {
                    appendMessage(msg.content, msg.role === 'user' ? 'user' : 'ai', msg.stats);
                });
            }

            function onModelChanged() {
                currentModel = document.getElementById('modelSelect').value;
            }

            function refreshModels() {
                vscode.postMessage({ command: 'getModels' });
            }

            function renderInstalledModels(models) {
                const container = document.getElementById('modelsList');
                container.innerHTML = "";

                if (!models || models.length === 0) {
                    container.innerHTML = '<div style="text-align:center; padding:20px; opacity:0.5; font-size:12px;">No models installed in Ollama. Pull one above.</div>';
                    return;
                }

                models.forEach(m => {
                    const card = document.createElement('div');
                    card.className = 'model-card';

                    // Parse model details
                    const sizeGB = (m.size / (1024 * 1024 * 1024)).toFixed(2);
                    const paramSize = m.details?.parameter_size || 'unknown';
                    const format = m.details?.format || 'gguf';

                    card.innerHTML = \`
                        <div class="model-details">
                            <div class="model-name">\${m.name}</div>
                            <div class="badge-row">
                                <span class="badge param">\${paramSize}</span>
                                <span class="badge">\${sizeGB} GB</span>
                                <span class="badge">\${format}</span>
                            </div>
                        </div>
                        <button class="delete-btn" onclick="deleteModel('\${m.name}')" title="Delete Model">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    \`;
                    container.appendChild(card);
                });
            }

            // Pull Model Logic
            function pullModel() {
                const modelInput = document.getElementById('pullModelInput');
                const modelName = modelInput.value.trim();
                if (!modelName) return;

                vscode.postMessage({ command: 'pullModel', model: modelName });
                modelInput.value = "";
                
                // Add initial progress entry
                updatePullProgress(modelName, 'starting download...', 0, 100);
            }

            function deleteModel(modelName) {
                if (confirm(\`Are you sure you want to delete the model '\${modelName}'?\`)) {
                    vscode.postMessage({ command: 'deleteModel', model: modelName });
                }
            }

            function updatePullProgress(model, status, completed, total) {
                const list = document.getElementById('progressList');
                let card = document.getElementById('pull-progress-' + model.replace(/[^a-zA-Z0-9]/g, '-'));
                
                if (!card) {
                    card = document.createElement('div');
                    card.id = 'pull-progress-' + model.replace(/[^a-zA-Z0-9]/g, '-');
                    card.className = 'progress-card';
                    list.appendChild(card);
                }

                const percent = total ? Math.round((completed / total) * 100) : 0;
                
                let detailText = status;
                if (total) {
                    const compMB = (completed / (1024 * 1024)).toFixed(1);
                    const totMB = (total / (1024 * 1024)).toFixed(1);
                    detailText = \`\${status} (\${compMB} MB / \${totMB} MB)\`;
                }

                card.innerHTML = \`
                    <div class="progress-info">
                        <strong>\${model}</strong>
                        <span>\${percent}%</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width: \${percent}%"></div>
                    </div>
                    <div class="progress-status">\${detailText}</div>
                \`;
            }

            function removePullProgress(model) {
                const card = document.getElementById('pull-progress-' + model.replace(/[^a-zA-Z0-9]/g, '-'));
                if (card) {
                    card.remove();
                }
            }

            // Chat Input & Resizing
            function autoGrow(element) {
                element.style.height = "5px";
                element.style.height = (element.scrollHeight) + "px";
            }

            function handleKeyDown(event) {
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                }
            }

            function setSendBtnLoading(loading) {
                const btn = document.getElementById('askBtn');
                btn.disabled = loading;
                if (loading) {
                    btn.innerHTML = \`
                        <svg class="spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="animation: spin 1s linear infinite;">
                            <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="8"></circle>
                        </svg>
                        <style>
                            @keyframes spin { to { transform: rotate(360deg); } }
                        </style>
                    \`;
                } else {
                    btn.innerHTML = \`
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    \`;
                }
            }

            function sendMessage() {
                if (isGenerating) return;
                const promptBox = document.getElementById('prompt');
                const text = promptBox.value.trim();
                if (!text) return;

                if (!currentModel) {
                    alert('Please select or download a model first!');
                    return;
                }

                // Append User Message
                appendMessage(text, 'user');
                chatHistory.push({ role: 'user', content: text });
                
                // Save immediately
                vscode.postMessage({ command: 'saveChatHistory', history: chatHistory });

                // Clean history array for Ollama API payload
                const apiHistory = chatHistory.slice(0, -1).map(h => ({
                    role: h.role,
                    content: h.content
                }));

                // Trigger Extension Chat call
                vscode.postMessage({
                    command: 'chat',
                    text: text,
                    model: currentModel,
                    history: apiHistory,
                    systemPrompt: currentSettings.systemPrompt,
                    temperature: currentSettings.temperature,
                    contextLength: currentSettings.contextLength
                });

                promptBox.value = "";
                promptBox.style.height = "auto";
            }

            function clearChat() {
                if (confirm('Start a new conversation and clear chat history?')) {
                    chatHistory = [];
                    vscode.postMessage({ command: 'saveChatHistory', history: [] });
                    
                    const responseBox = document.getElementById('response');
                    responseBox.innerHTML = \`
                        <div class="message-wrapper ai">
                            <span class="message-sender">Assistant</span>
                            <div class="message-bubble">
                                <p>Hello! I am your local Ollama coding assistant. Select a model above and ask me anything, or right-click some code in your editor to analyze it!</p>
                            </div>
                        </div>
                    \`;
                }
            }



            // Context Menu commands handler
            function handleContextCommand(action, code) {
                switchTab('chat-tab');
                
                let prompt = "";
                switch (action) {
                    case 'explain':
                        prompt = "Explain the following code snippet, focusing on what it does, its structure, and how it works:";
                        break;
                    case 'bugs':
                        prompt = "Analyze the following code for potential bugs, performance bottlenecks, and security vulnerabilities. Provide a refactored version of the code that optimizes it and fixes any issues:";
                        break;
                    case 'tests':
                        prompt = "Generate comprehensive unit tests for the following code snippet. Cover typical use cases, edge cases, and error conditions, using a standard testing framework appropriate for this language:";
                        break;
                    case 'document':
                        prompt = "Generate clear, descriptive JSDoc/Docstring/comments documentation for the following code snippet. Return the documented code:";
                        break;
                }

                const fullPromptText = \`\${prompt}\n\n\` + "\`\`\`\n" + code + "\n\`\`\`";
                
                // Fill prompt box
                const promptBox = document.getElementById('prompt');
                promptBox.value = fullPromptText;
                autoGrow(promptBox);
                
                // Auto trigger send
                sendMessage();
            }
        </script>
    </body>
    </html>
    `;
}
