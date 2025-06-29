// Set the workerSrc property
pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs/pdf.worker.js';

const fileInput = document.getElementById('file-input');
const container = document.getElementById('container');

fileInput.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file && file.type === 'application/pdf') {
    const reader = new FileReader();
    reader.onload = function(ev) {
      const typedarray = new Uint8Array(ev.target.result);
      renderPDF(typedarray);
    };
    reader.readAsArrayBuffer(file);
  }
});

function renderPDF(data) {
  pdfjsLib.getDocument({data}).promise.then(function(pdf) {
    // Clear previous pages
    container.innerHTML = '';
    // Render all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      pdf.getPage(pageNum).then(function(page) {
        const viewport = page.getViewport({scale: 1.5});
        // Create page container
        const pageContainer = document.createElement('div');
        pageContainer.style.position = 'relative';
        pageContainer.style.marginBottom = '16px';
        pageContainer.style.width = viewport.width + 'px';
        pageContainer.style.height = viewport.height + 'px';
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.display = 'block';
        canvas.style.border = '1px solid #ccc';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.zIndex = '1';
        // Create textLayer
        const textLayerDiv = document.createElement('div');
        textLayerDiv.style.position = 'absolute';
        textLayerDiv.style.top = '0';
        textLayerDiv.style.left = '0';
        textLayerDiv.style.width = '100%';
        textLayerDiv.style.height = '100%';
        textLayerDiv.style.zIndex = '2';
        textLayerDiv.className = 'textLayer';
        // Append canvas and textLayer to page container
        pageContainer.appendChild(canvas);
        pageContainer.appendChild(textLayerDiv);
        container.appendChild(pageContainer);
        // Render PDF page into canvas context
        const ctx = canvas.getContext('2d');
        page.render({canvasContext: ctx, viewport: viewport});
        // Render text layer for selection
        page.getTextContent().then(function(textContent) {
          pdfjsLib.renderTextLayer({
            textContent: textContent,
            container: textLayerDiv,
            viewport: viewport,
            textDivs: [],
            enhanceTextSelection: true
          });
        });
      });
    }
  });
}

function getSelectedText() {
  return window.getSelection ? window.getSelection().toString() : '';
}

function getAllVisibleText() {
  const container = document.getElementById('container');
  if (!container) return '';
  let visibleText = '';
  const viewportTop = 0;
  const viewportBottom = window.innerHeight;
  const viewportLeft = 0;
  const viewportRight = window.innerWidth;
  const textLayers = container.querySelectorAll('.textLayer');
  textLayers.forEach(layer => {
    const textDivs = Array.from(layer.childNodes);
    textDivs.forEach(div => {
      if (!(div instanceof HTMLElement)) return;
      const rect = div.getBoundingClientRect();
      const isVisible = (
        rect.bottom > viewportTop &&
        rect.top < viewportBottom &&
        rect.right > viewportLeft &&
        rect.left < viewportRight
      );
      if (isVisible) {
        visibleText += div.innerText + ' ';
      }
    });
  });
  return visibleText.trim();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPdfSelectedText') {
    sendResponse({ text: getSelectedText() });
  }
  if (request.action === 'getPdfAllText') {
    sendResponse({ text: getAllVisibleText() });
  }
});
