# BilingualPDF Chrome Extension

**BilingualPDF** is a Chrome extension designed to help users read and understand PDF documents (and web pages) in two languages, making it especially useful for technical paper reading, language learners, and researchers.

## Features

- **Bilingual PDF Reading**: Read and translate PDF content side-by-side in your target language (e.g., English & Chinese).
- **AI-Powered Summarization**: Summarize entire pages or selected text using your own OpenAI-compatible API endpoint.
- **Full-Page Translation**: Instantly translate the full content of a PDF or web page into your chosen language.
- **Chat with AI**: Built-in chat interface to ask questions, get explanations, or discuss content with an LLM (e.g., GPT-4o).
- **Customizable Models**: Choose from different LLM models and set your own API URL and key.
- **Math & Markdown Support**: Renders LaTeX math and Markdown beautifully using MathJax and Marked.js.
- **User-Friendly UI**: Modern, responsive sidebar with easy access to chat, inspect, and settings panels.

## How It Works

1. **Install the Extension**: Load the unpacked extension in Chrome.
2. **Open a PDF or Web Page**: Click the extension icon or use the sidebar.
3. **Interact via Sidebar**:
   - **Chat**: Ask questions or discuss content with the AI.
   - **Inspect**: Select text, summarize, or translate the current page.
   - **Settings**: Configure your API endpoint, key, model, and target language.
4. **Use Hotkeys**: Quickly toggle the sidebar with `Ctrl+Shift+Y`.

## Setup

1. **Clone this repository** and open Chrome's Extensions page (`chrome://extensions/`).
2. Enable **Developer mode** and click **Load unpacked**.
3. Select the project folder.
4. In the extension sidebar, go to **Settings** and enter your API URL and Key (e.g., for OpenAI or compatible services).

## Permissions

- `storage`: Save your settings locally.
- `activeTab`, `tabs`, `sidePanel`: Interact with the current page and display the sidebar.

## Screenshots

*(Add screenshots here of the sidebar, chat, and translation features)*

## Security & Privacy

- **No sensitive data is stored or transmitted by default.**
- API keys and settings are stored only in your browser's local storage.
- No analytics or tracking.

## Contributing

Contributions, bug reports, and feature requests are welcome!  
Please open an issue or submit a pull request.

## License

This project is open source under the [Apache-2.0 License](LICENSE). 