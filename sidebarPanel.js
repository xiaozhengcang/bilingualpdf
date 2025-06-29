// Panel switching and command button logic for sidebar.html

document.addEventListener('DOMContentLoaded', function () {
  function showPanel(panel) {
    document.getElementById('mainPanel').classList.add('hidden');
    document.getElementById('inspectPanel').classList.add('hidden');
    document.getElementById('thirdPanel').classList.add('hidden');
    if (panel === 'main') document.getElementById('mainPanel').classList.remove('hidden');
    if (panel === 'inspect') document.getElementById('inspectPanel').classList.remove('hidden');
    if (panel === 'third') document.getElementById('thirdPanel').classList.remove('hidden');
    // Update button styles
    document.getElementById('cmd-main').classList.toggle('bg-blue-500', panel === 'main');
    document.getElementById('cmd-main').classList.toggle('bg-gray-400', panel !== 'main');
    document.getElementById('cmd-inspect').classList.toggle('bg-blue-500', panel === 'inspect');
    document.getElementById('cmd-inspect').classList.toggle('bg-gray-400', panel !== 'inspect');
    document.getElementById('cmd-settings').classList.toggle('bg-blue-500', panel === 'third');
    document.getElementById('cmd-settings').classList.toggle('bg-gray-400', panel !== 'third');
    // Attach listeners for inspectPanel when shown
    if (panel === 'inspect' && window.attachInspectPanelListeners) {
      window.attachInspectPanelListeners();
    }
  }
  document.getElementById('cmd-main').onclick = () => showPanel('main');
  document.getElementById('cmd-inspect').onclick = () => showPanel('inspect');
  document.getElementById('cmd-settings').onclick = () => showPanel('third');
  // Show inspect panel by default
  showPanel('inspect');

  if (!window.marked) {
    console.warn('Marked.js is not loaded! Markdown rendering will not work.');
  }

  // Settings form logic
  const apiUrlInput = document.getElementById('apiUrlInput');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const targetLanguageInput = document.getElementById('targetLanguageInput');
  const modelNameInput = document.getElementById('modelNameInput');
  const settingsForm = document.getElementById('settingsForm');
  const settingsSavedMsg = document.getElementById('settingsSavedMsg');

  // Load from localStorage
  function loadSettings() {
    apiUrlInput.value = localStorage.getItem('API_URL') || '';
    apiKeyInput.value = localStorage.getItem('API_KEY') || '';
    targetLanguageInput.value = localStorage.getItem('TARGET_LANGUAGE') || '';
    modelNameInput.value = localStorage.getItem('MODEL_NAME') || '';
  }

  settingsForm.addEventListener('submit', function(e) {
    e.preventDefault();
    localStorage.setItem('API_URL', apiUrlInput.value);
    localStorage.setItem('API_KEY', apiKeyInput.value);
    localStorage.setItem('TARGET_LANGUAGE', targetLanguageInput.value);
    localStorage.setItem('MODEL_NAME', modelNameInput.value);
    settingsSavedMsg.classList.remove('hidden');
    setTimeout(() => settingsSavedMsg.classList.add('hidden'), 1500);
  });

  // Load settings on panel show
  if (document.getElementById('thirdPanel')) {
    loadSettings();
  }
}); 