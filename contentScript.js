// Debug: script loaded
console.log('[contentScript] loaded');

// Listen for selection changes and notify the extension
function getDomPath(el) {
  if (!el) return '';
  if (el.id) return `#${el.id}`;
  let path = [];
  while (el && el.nodeType === Node.ELEMENT_NODE) {
    let selector = el.nodeName.toLowerCase();
    if (el.className) {
      selector += '.' + Array.from(el.classList).join('.');
    }
    let sibling = el;
    let nth = 1;
    while (sibling = sibling.previousElementSibling) {
      if (sibling.nodeName === el.nodeName) nth++;
    }
    selector += `:nth-of-type(${nth})`;
    path.unshift(selector);
    el = el.parentElement;
  }
  return path.length ? path.join(' > ') : '';
}

let lastDomPath = '';
function notifyDomPath(force) {
  let active = document.activeElement;
  if (window.getSelection && window.getSelection().anchorNode) {
    let node = window.getSelection().anchorNode;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    if (node) active = node;
  }
  const domPath = getDomPath(active);
  if (force || domPath !== lastDomPath) {
    lastDomPath = domPath;
    console.log('[contentScript] Sending selectedDomPath:', domPath);
    chrome.runtime.sendMessage({ action: 'selectedDomPath', domPath });
  }
}

function notifySelectedText(force) {
  let selectedText = '';
  if (window.getSelection) {
    selectedText = window.getSelection().toString();
  }
  if (force || selectedText !== notifySelectedText.lastText) {
    notifySelectedText.lastText = selectedText;
    console.log('[contentScript] Sending selectedText:', selectedText);
    chrome.runtime.sendMessage({ action: 'selectedText', selectedText });
  }
}
notifySelectedText.lastText = '';

// Update event listeners to also notify selected text

document.addEventListener('selectionchange', function() {
  console.log('[contentScript] selectionchange event');
  notifyDomPath();
  notifySelectedText();
}, true);
document.addEventListener('mouseup', function() {
  console.log('[contentScript] mouseup event');
  notifyDomPath();
  notifySelectedText();
}, true);

// Fallback polling approach
setInterval(function() {
  notifyDomPath();
  notifySelectedText();
}, 1000);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelectedText') {
    let active = document.activeElement;
    if (window.getSelection && window.getSelection().anchorNode) {
      let node = window.getSelection().anchorNode;
      if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
      if (node) active = node;
    }
    const domPath = getDomPath(active);
    console.log('[contentScript] Returning DOM path:', domPath);
    sendResponse({ selectedText: domPath });
  }
  if (request.action === 'getPageText') {
    // Get all visible text from the page that is in the current viewport
    function isInViewport(el) {
      const rect = el.getBoundingClientRect();
      return (
        rect.top < window.innerHeight &&
        rect.bottom > 0 &&
        rect.left < window.innerWidth &&
        rect.right > 0 &&
        window.getComputedStyle(el).visibility !== 'hidden' &&
        window.getComputedStyle(el).display !== 'none'
      );
    }
    function getVisibleTextFromNode(node) {
      let text = '';
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent.trim() && node.parentElement && isInViewport(node.parentElement)) {
          text += node.textContent.trim() + ' ';
        }
      } else if (node.nodeType === Node.ELEMENT_NODE && isInViewport(node)) {
        for (let child of node.childNodes) {
          text += getVisibleTextFromNode(child);
        }
      }
      return text;
    }
    let pageText = getVisibleTextFromNode(document.body).replace(/\s+/g, ' ').trim();
    sendResponse({ pageText });
  }
}); 