// Remove existing sidebar if present
function removeSidebar() {
  const sidebar = document.getElementById('plugin-chat-sidebar');
  if (sidebar) sidebar.remove();
}

function createSidebar() {
  if (document.getElementById('plugin-chat-sidebar')) return;
  const sidebar = document.createElement('div');
  sidebar.id = 'plugin-chat-sidebar';
  sidebar.innerHTML = `
    <style>
      #plugin-chat-sidebar {
        position: fixed;
        top: 0;
        right: 0;
        width: 400px;
        height: 100vh;
        z-index: 999999;
        background: #e5e7eb;
        box-shadow: -2px 0 8px rgba(0,0,0,0.15);
        display: flex;
        flex-direction: column;
        font-family: sans-serif;
      }
      #plugin-chat-sidebar .sidebar-container {
        width: 100%;
        height: 100vh;
        display: flex;
        flex-direction: column;
        background: #e5e7eb;
        overflow-y: hidden;
      }
      #plugin-chat-sidebar .flex-grow {
        flex-grow: 1;
      }
      #plugin-chat-sidebar .min-h-screen, #plugin-chat-sidebar .max-h-screen {
        min-height: 100vh !important;
        max-height: 100vh !important;
        height: 100% !important;
      }
      #plugin-chat-sidebar textarea {
        resize: none;
      }
      #plugin-chat-sidebar button {
        cursor: pointer;
      }
    </style>
    <div class="sidebar-container">
      <div class="flex-grow flex flex-col p-4 overflow-y-hidden">
        <div id="resultContainer" class="flex-grow bg-gray-100 rounded-lg overflow-y-auto mb-4 p-4">
          <p class="text-gray-500 text-sm mb-2">gpt-4o-mini</p>
          <p id="resultText" class="whitespace-pre-line"></p>
          <div id="chatbox" class="text-sm"></div>
        </div>
        <div class="flex items-center space-x-4">
          <textarea id="promptInput" class="flex-grow border rounded-md p-3" placeholder="Input..."></textarea>
          <button id="generateBtn" class="bg-blue-500 text-white px-4 py-3 rounded-md">Send</button>
          <button id="stopBtn" class="bg-yellow-500 text-white px-4 py-3 rounded-md">Clear</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(sidebar);

  // Add chat logic
  const promptInput = sidebar.querySelector('#promptInput');
  const generateBtn = sidebar.querySelector('#generateBtn');
  const stopBtn = sidebar.querySelector('#stopBtn');
  const resultText = sidebar.querySelector('#resultText');
  const chatbox = sidebar.querySelector('#chatbox');

  generateBtn.onclick = function() {
    const value = promptInput.value.trim();
    if (!value) return;
    // For demo, just echo input. Replace with your chat logic.
    chatbox.innerHTML += `<div class='mb-2'><b>You:</b> ${value}</div>`;
    promptInput.value = '';
    // Simulate response
    setTimeout(() => {
      chatbox.innerHTML += `<div class='mb-2'><b>Bot:</b> (response to: ${value})</div>`;
      chatbox.scrollTop = chatbox.scrollHeight;
    }, 500);
  };
  stopBtn.onclick = function() {
    chatbox.innerHTML = '';
    resultText.textContent = '';
    promptInput.value = '';
  };
}

function toggleSidebar() {
  const sidebar = document.getElementById('plugin-chat-sidebar');
  if (sidebar) {
    removeSidebar();
  } else {
    createSidebar();
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'toggleSidebar') {
    toggleSidebar();
  }
  if (msg.action === 'getSelectedText') {
    let selectedText = '';
    if (window.getSelection) {
      selectedText = window.getSelection().toString();
    } else if (document.selection && document.selection.type === 'Text') {
      selectedText = document.selection.createRange().text;
    }
    sendResponse({ selectedText });
    return true; // keep the message channel open for async response
  }
});

// Optionally, auto-inject on load (comment out if not desired)
// createSidebar(); 