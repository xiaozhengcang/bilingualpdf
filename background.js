console.log('OpenAI API Chat Chrome extension loaded.'); 

chrome.action.onClicked.addListener(async (tab) => {
  // Try to open the side panel (Chrome 114+)
  if (chrome.sidePanel && chrome.sidePanel.open) {
    await chrome.sidePanel.open({ windowId: tab.windowId });
  } else {
    // Fallback: send a message to toggle the sidebar
    //chrome.tabs.sendMessage(tab.id, { action: 'toggleSidebar' });
  }
}); 

chrome.commands.onCommand.addListener(function(command) {
  if (command === 'toggle-sidebar') {
    if (chrome.sidePanel && chrome.sidePanel.open) {
      chrome.sidePanel.open({ windowId: tab.windowId });
    } else {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'toggleSidebar'});
    });
  }
  }
}); 