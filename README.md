# BilingualPDF Chrome Extension

BilingualPDF is a Chrome extension designed to help users read and understand PDFs and web pages with bilingual support. It is especially useful for reading technical papers, allowing users to translate, summarize, and interact with content in their target language (default: Chinese), with special handling for technical terminology and markdown formatting.

---

## Features

- **Sidebar UI**: Access chat (AI assistant), inspect, and settings panels from a convenient sidebar.
- **PDF Viewer**: Open, view, and select text in PDFs with translation and summarization features.
- **AI Integration**: Translate, summarize, and chat with content using the OpenAI API (configurable).
- **Customizable Settings**: Set your API URL, API key, model, and target language.
- **Math Rendering**: MathJax support for rendering LaTeX/MathML equations.
- **Markdown Parsing**: Marked.js for rendering markdown-formatted responses.
- **PDF Rendering**: Uses PDF.js for fast, reliable PDF viewing.
- **Keyboard Shortcuts**: Quickly toggle the sidebar and access features.

---

## Installation

1. **Clone or Download** this repository to your local machine.
2. **Open Chrome** and navigate to `chrome://extensions/`.
3. **Enable Developer Mode** (top right corner).
4. **Click "Load unpacked"** and select the `plugin_chat` directory.
5. The BilingualPDF extension icon should appear in your Chrome toolbar.

---

## Usage

1. **Open a PDF or any web page** in Chrome.
2. **Click the BilingualPDF icon** or use the keyboard shortcut (`Ctrl+Shift+Y`) to open the sidebar.
3. **Upload or open a PDF** using the sidebar or the custom PDF viewer.
4. **Select text** in the PDF or web page.
5. **Use the sidebar buttons** to translate, summarize, or chat about the selected content.
6. **Configure settings** (API URL, key, model, target language) in the Settings panel.

---

## Configuration

- **API URL**: Set the endpoint for the OpenAI-compatible API.
- **API Key**: Enter your API key for authentication.
- **Model**: Choose the language model (e.g., `gpt-3.5-turbo`).
- **Target Language**: Set your preferred output language (default: Chinese).

All settings are accessible via the sidebar's Settings panel.

---

## Keyboard Shortcuts

- **Toggle Sidebar**: `Ctrl+Shift+Y`
- (More shortcuts may be added in future releases.)

---

## Technical Details

- **Manifest Version**: Chrome Extension Manifest V3
- **Languages**: JavaScript (ES6)
- **Main Files**:
  - `background.js`: Background service worker
  - `chat.js`: Chat and AI assistant logic
  - `contentScript.js`: Injects sidebar and handles page interaction
  - `inspectPanel.js`, `sidebar.js`, `sidebarPanel.js`: UI logic
  - `pdf_viewer.js`, `pdf_viewer.html`: Custom PDF viewer
  - `MathJax/`, `pdfjs/`, `marked.min.js`: Third-party libraries

---

## Dependencies & Licenses

- **[MathJax](https://github.com/mathjax/MathJax)** (Apache License 2.0)
  - Used for rendering mathematical notation (LaTeX, MathML).
  - See `MathJax/README.md` and `MathJax/LICENSE` for details.
- **[PDF.js](https://github.com/mozilla/pdf.js)** (Apache License 2.0)
  - Used for PDF rendering in the custom viewer.
  - See `pdfjs/` and [PDF.js License](https://github.com/mozilla/pdf.js/blob/master/LICENSE).
- **[Marked.js](https://github.com/markedjs/marked)** (MIT License)
  - Used for markdown parsing and rendering.
  - See `marked.min.js` and [Marked.js License](https://github.com/markedjs/marked/blob/master/LICENSE).

---

## Credits

- **MathJax**: https://www.mathjax.org/
- **PDF.js**: https://mozilla.github.io/pdf.js/
- **Marked.js**: https://marked.js.org/

This project is not affiliated with or endorsed by the above projects. Please see their respective repositories for more information.

---

## Contribution Guidelines

Contributions are welcome! To contribute:

1. Fork this repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes and commit them with clear messages.
4. Submit a pull request describing your changes.

Please ensure your code follows the existing style and includes appropriate documentation. For major changes, open an issue first to discuss your ideas.

---

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.

---

## Disclaimer

BilingualPDF is provided as-is, without warranty of any kind. Use at your own risk. Always review and comply with the terms of service for any third-party APIs you use with this extension.
