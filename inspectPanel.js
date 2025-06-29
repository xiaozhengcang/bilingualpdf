// Logic for the inspectPanel: display selected text from the active tab

function attachInspectPanelListeners() {
  // No need to fetch selected text here; contentScript.js will send updates
}

// Optionally, attach on DOMContentLoaded if panel is visible
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', attachInspectPanelListeners);
} else {
  attachInspectPanelListeners();
}

// Expose for sidebar.html inline script
window.attachInspectPanelListeners = attachInspectPanelListeners;

// Store the latest selected text
let latestSelectedText = '';

function getModelName() {
  return localStorage.getItem('MODEL_NAME')?.trim() || 'gpt-4o-mini';
}

// Add logic for Page Summary button
function streamLLMResult({prompt, systemPrompt, button, summaryArea, selectedTextArea, buttonLabel}) {
  button.disabled = true;
  button.textContent = 'Loading...';
  summaryArea.innerHTML = '';
  const API_URL = localStorage.getItem('API_URL') || '';
  const API_KEY = localStorage.getItem('API_KEY') || '';
  const model = getModelName();
  const body = JSON.stringify({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    stream: true
  });
  let reply = '';
  fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body
  }).then(async res => {
    if (!res.ok || !res.body) throw new Error('Network error');
    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let done = false;
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        buffer += decoder.decode(value, { stream: true });
        let lines = buffer.split('\n');
        buffer = lines.pop();
        for (let line of lines) {
          line = line.trim();
          if (!line) continue;
          if (line.startsWith('data:')) line = line.slice(5).trim();
          if (line === '[DONE]') continue;
          try {
            const data = JSON.parse(line);
            const content = data.choices?.[0]?.delta?.content;
            if (content) {
              reply += content;
              summaryArea.innerHTML = window.marked.parse(reply);
              if (window.MathJax && window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise([summaryArea]);
              }
            }
          } catch (e) {
            // ignore parse errors
          }
        }
      }
    }
  }).catch(e => {
    summaryArea.innerHTML = '[Error: ' + (e.message || e) + ']';
  }).finally(() => {
    button.disabled = false;
    button.textContent = buttonLabel;
  });
}

// Helper: Check if PDF viewer is active (implement your own logic)
function isPdfViewerActive() {
  // Returns true if the PDF viewer window is open (set by sidebarPanel.js)
  return !!window.pdfViewerWindow && !window.pdfViewerWindow.closed;
}

// Helper: Get text from PDF viewer
function getTextFromPdfViewer(type = 'all') {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        action: type === 'selected' ? 'getPdfSelectedText' : 'getPdfAllText'
      },
      (response) => {
        resolve(response?.text || '');
      }
    );
  });
}

function getTargetLanguage() {
  return localStorage.getItem('TARGET_LANGUAGE')?.trim() || 'Chinese';
}

// Helper: Get full page text (from PDF or web page)
async function getFullPageText() {
  if (isPdfViewerActive()) {
    // Get all visible text from PDF viewer
    const pageText = await getTextFromPdfViewer('all');
    if (!pageText) {
      return '[Error: Could not retrieve PDF text]';
    }
    return pageText;
  }
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const tab = tabs[0];
      if (!tab || !tab.id) {
        resolve('[Error: No active tab]');
        return;
      }
      chrome.tabs.sendMessage(tab.id, { action: 'getPageText' }, function(response) {
        let pageText = response && response.pageText ? response.pageText : '';
        if (!pageText) {
          resolve('[Error: Could not retrieve page text]');
          return;
        }
        resolve(pageText);
      });
    });
  });
}

function setupPageSummaryButton() {
  const pageSummaryBtn = document.getElementById('pageSummaryBtn');
  const selectedTextArea = document.getElementById('selectedTextArea');
  const summaryArea = getSummaryAreaDiv();
  if (!pageSummaryBtn || !selectedTextArea || !summaryArea) return;
  pageSummaryBtn.addEventListener('click', async () => {
    const targetLanguage = getTargetLanguage();
    const pageText = await getFullPageText();
    if (!pageText || pageText.startsWith('[Error')) {
      selectedTextArea.value = pageText;
      return;
    }
    selectedTextArea.value = pageText;
    summaryArea.innerHTML = 'Summarizing...';
    streamLLMResult({
      prompt: `Summarize the following content in a concise paragraph    in ${targetLanguage}:\n\n${pageText} `,
      systemPrompt: `You are a helpful assistant that summarizes documents in ${targetLanguage}. rule 1: output the summary only without any greeting or introduction. rule 2: use both original and target language if the word is a terminology, rule 3: make the output with proper markdown format for better reading `,
      button: pageSummaryBtn,
      summaryArea,
      selectedTextArea,
      buttonLabel: 'Summarize Page'
    });
  });
}

// Listen for selected text updates from content script
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log('[inspectPanel] Received message:', message);
  const selectedTextArea = document.getElementById('selectedTextArea');
  if (message.action === 'selectedText' && message.selectedText !== undefined) {
    latestSelectedText = message.selectedText;
    if (selectedTextArea) {
      selectedTextArea.value = message.selectedText;
      console.log('[inspectPanel] Live selected text update:', message.selectedText);
    }
  }
});

// Add logic for Full Translate button
function setupFullTranslateButton() {
  const fullTranslateBtn = document.getElementById('fullTranslateBtn');
  const selectedTextArea = document.getElementById('selectedTextArea');
  const summaryArea = getSummaryAreaDiv();
  if (!fullTranslateBtn || !selectedTextArea || !summaryArea) return;
  fullTranslateBtn.addEventListener('click', async () => {
    const targetLanguage = getTargetLanguage();
    const pageText = await getFullPageText();
    if (!pageText || pageText.startsWith('[Error')) {
      selectedTextArea.value = pageText;
      return;
    }
    selectedTextArea.value = pageText;
    summaryArea.innerHTML = 'Translating...';
    streamLLMResult({
      prompt: `Translate the following content into fluent ${targetLanguage}, preserving the original meaning and details\n\n${pageText}`,
      systemPrompt: `You are a helpful assistant that translates documents into ${targetLanguage}. rule 1: output the summary only without any greeting or introduction. rule 2: use both original and target language if the word is a terminology, rule 3: make the output with proper markdown format for better reading `,
      button: fullTranslateBtn,
      summaryArea,
      selectedTextArea,
      buttonLabel: 'Translate Page'
    });
  });
}

// Font size slider logic
function setupFontSizeSlider() {
  const fontSizeSlider = document.getElementById('fontSizeSlider');
  const fontSizeValue = document.getElementById('fontSizeValue');
  const selectedTextArea = document.getElementById('selectedTextArea');
  const summaryArea = getSummaryAreaDiv();
  if (!fontSizeSlider || !fontSizeValue || !selectedTextArea || !summaryArea) return;
  function applyFontSize(size) {
    selectedTextArea.style.fontSize = size + 'px';
    summaryArea.style.fontSize = size + 'px';
  }
  fontSizeSlider.addEventListener('input', function() {
    fontSizeValue.textContent = fontSizeSlider.value;
    applyFontSize(fontSizeSlider.value);
  });
  // Set initial font size
  applyFontSize(fontSizeSlider.value);
}

// Add logic for the toggle button to show/hide the Selected Text area
function setupSelectedTextToggle() {
  const toggleBtn = document.getElementById('toggleSelectedTextBtn');
  const selectedTextContainer = document.getElementById('selectedTextContainer');
  const selectedTextArea = document.getElementById('selectedTextArea');
  if (!toggleBtn || !selectedTextContainer || !selectedTextArea) return;
  // Prevent multiple event listeners
  if (toggleBtn._toggleListenerAttached) return;
  function updateLabel() {
    toggleBtn.textContent = selectedTextContainer.style.display === 'none' ? 'Show Selected' : 'Hide Selected';
  }
  toggleBtn.addEventListener('click', async function() {
    if (selectedTextContainer.style.display === 'none') {
      selectedTextContainer.style.display = '';
      // Fetch and display full page text when showing the area
      const pageText = await getFullPageText();
      selectedTextArea.value = pageText;
    } else {
      selectedTextContainer.style.display = 'none';
    }
    updateLabel();
  });
  // Ensure hidden by default and label is correct
  selectedTextContainer.style.display = 'none';
  updateLabel();
  toggleBtn._toggleListenerAttached = true;
}

// Patch panel show logic to update textarea with latestSelectedText
if (window.attachInspectPanelListeners) {
  const origAttach = window.attachInspectPanelListeners;
  window.attachInspectPanelListeners = function() {
    origAttach();
    // After original logic, update textarea with latestSelectedText if available
    const panel = document.getElementById('inspectPanel');
    const selectedTextArea = document.getElementById('selectedTextArea');
    if (panel && selectedTextArea && panel.style.display !== 'none' && !panel.classList.contains('hidden')) {
      selectedTextArea.value = latestSelectedText;
      console.log('[inspectPanel] Updated selectedTextArea with latest value on panel show:', latestSelectedText);
    }
    // Setup Page Summary button logic
    setupPageSummaryButton();
    // Setup Full Translate button logic
    setupFullTranslateButton();
    // Setup Font Size slider logic
    setupFontSizeSlider();
    // Setup Selected Text toggle logic
    setupSelectedTextToggle();
  };
}

document.addEventListener('DOMContentLoaded', function () {
  const fileBtn = document.getElementById('fileBtn');
  if (fileBtn) {
    fileBtn.onclick = function () {
      window.pdfViewerWindow = window.open('pdf_viewer.html', '_blank');
    };
  }
});

// --- 1. Helper to get summary area as a div ---
function getSummaryAreaDiv() {
  return document.getElementById('summaryArea');
} 