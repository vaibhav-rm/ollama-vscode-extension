# Ollama VSCode Chat 🦙💬

A premium, feature-rich Visual Studio Code extension that integrates directly with [Ollama](https://ollama.com). It provides a gorgeous sidebar interface for chat, advanced model parameters configuration, visual model downloads, and rich editor context menu integration.

![Ollama VSCode Chat](https://i.ibb.co/Kc9hXgSf/image.png)

---

## Key Features

- 📱 **Sleek Sidebar Chat Panel**: Always-accessible sidebar panel that styled to adapt perfectly to your active VS Code theme (Dark, Light, High Contrast).
- ⚙️ **Advanced Settings drawer**: Tweak model parameters on the fly—adjust **Temperature**, specify **System Prompts**, and increase **Context length** directly from the UI.
- 🛠️ **Deep Editor Integration**:
  - Right-click selection context menu:
    - **Ollama AI: Explain Code**
    - **Ollama AI: Find Bugs & Optimize**
    - **Ollama AI: Generate Unit Tests**
    - **Ollama AI: Write Documentation**
  - Instant code insertion: Insert generated code blocks directly into your active text editor cursor position with a single click.
- 📦 **Visual Model Manager**:
  - List installed models along with size, parameter counts (e.g. `8B`), and format (`gguf`).
  - Delete unwanted models with confirmation.
  - Pull and download new models with a real-time progress bar showing percentage, status, and size updates.
- 🔄 **Conversation Persistence**: Auto-saves chat history per workspace, allowing you to pick up exactly where you left off.
- 📊 **Real-Time Performance Metrics**: Displays generation speed (tokens/sec), total response time, and prompt token count below every response.
- 🟢 **Live Status Indicator**: Visual indicator (pulsing green/red status light) shows if your local Ollama instance is online or offline.
- ⚡ **Offline-First Resilience**: Robust Markdown and PrismJS syntax highlighting with offline fallbacks so you can code without internet access.

---

## Installation & Setup

### 1. Install Ollama
Download and run Ollama on your machine:
- **Windows**: [Download Ollama for Windows](https://ollama.com/download)
- **macOS / Linux**:
  ```sh
  curl -fsSL https://ollama.com/install.sh | sh
  ```

### 2. Download a Local Model
Pull a lightweight model to get started:
```sh
ollama pull deepseek-r1:8b
# or
ollama pull llama3.2
```

### 3. Open the Sidebar Chat
1. Click the **Ollama AI** icon in the VS Code Activity Bar (on the left side).
2. Start chatting!

---

## Advanced Configurations

Modify settings via `File -> Preferences -> Settings` (or `Ctrl + ,`), searching for `Ollama`:

| Setting | Type | Default | Description |
|---|---|---|---|
| `ollama.apiUrl` | String | `http://localhost:11434` | The endpoint URL of your Ollama instance (change to support remote servers). |
| `ollama.systemPrompt` | String | `You are a helpful, expert AI software developer...` | The default system instructions for the LLM behavior. |
| `ollama.temperature` | Number | `0.7` | Controls randomness (0.0 is deterministic, 1.0 is creative). |
| `ollama.contextLength` | Integer | `4096` | Maximum token window capacity of the model. |

---

## Editor Actions & Inline Editor Usage

1. **Right-Click Context Menu Actions**:
   - Open any code file and select a block of code.
   - Right-click and choose one of the **Ollama AI** options (e.g. *Explain Code*).
   - The sidebar will automatically focus and stream the analysis on your selection.
2. **One-Click Inline Insertion**:
   - In any generated response within the chat sidebar, click the **Insert** button on the code block's header.
   - This will paste the code snippet directly back into your active text editor at the current cursor position.
3. **VS Code Native Inline Chat (`Ctrl + I` / `Cmd + I`)**:
   - For direct inline code generation or edits in the editor workspace, press `Ctrl + I` (Windows/Linux) or `Cmd + I` (macOS).
   - Use a compatible local LLM connector extension (such as *Continue*) linked to your Ollama local server (`http://localhost:11434`) to use VS Code's native inline editing experience.

## License

Licensed under the MIT License.
