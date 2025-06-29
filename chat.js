// Minimal chat.js for sidebar.html

document.addEventListener('DOMContentLoaded', function () {
  const promptInput = document.getElementById('promptInput');
  const generateBtn = document.getElementById('generateBtn');
  const stopBtn = document.getElementById('stopBtn');
  const resultText = document.getElementById('resultText');
  const chatbox = document.getElementById('chatbox');
  const API_URL = localStorage.getItem('API_URL') || '';
  const API_KEY = localStorage.getItem('API_KEY') || '';
  const chatHistory = [];
  const modelNameDisplay = document.getElementById('modelNameValue');
  const storedModelName = localStorage.getItem('MODEL_NAME') || 'gpt-4o-mini';
  if (modelNameDisplay) modelNameDisplay.textContent = storedModelName;

  generateBtn.addEventListener('click', async function () {
    const userInput = promptInput.value.trim();
    if (userInput) {
      // Add user message to history
      chatHistory.push({ role: 'user', content: userInput });
      // Append user message to resultText (right aligned, no label)
      resultText.innerHTML += `<div class='text-right mb-1'><span class='bg-blue-100 px-2 py-1 rounded inline-block'>${userInput}</span></div>`;
      // Show loading for bot reply (left aligned, no label)
      resultText.innerHTML += `<div class='text-left mb-1 bot-loading'><span class='bg-green-100 px-2 py-1 rounded inline-block bot-reply'>Loading...</span></div>`;
      promptInput.value = '';
      chatbox.scrollTop = chatbox.scrollHeight;
      try {
        const selectedModel = storedModelName;
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: chatHistory,
            stream: true
          })
        });
        if (!response.ok) throw new Error('Network response was not ok');
        // Streamed response handling
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let reply = '';
        // Find the last bot-reply span to update
        const botReplySpans = resultText.getElementsByClassName('bot-reply');
        const currentBotReply = botReplySpans[botReplySpans.length - 1];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          // Try to extract text from chunk (assuming OpenAI-style data: lines)
          chunk.split('\n').forEach(line => {
            if (line.startsWith('data:')) {
              const data = line.replace('data:', '').trim();
              if (data && data !== '[DONE]') {
                try {
                  const parsed = JSON.parse(data);
                  // OpenAI-style: choices[0].delta.content or choices[0].text
                  const content = (parsed.choices && parsed.choices[0] && (parsed.choices[0].delta?.content || parsed.choices[0].text)) || '';
                  if (content) {
                    reply += content;
                    if (currentBotReply) {
                      // Render markdown to HTML
                      currentBotReply.innerHTML = marked.parse(reply);
                      // Re-typeset math
                      if (window.MathJax && window.MathJax.typesetPromise) {
                        window.MathJax.typesetPromise([currentBotReply]);
                      }
                    }
                    chatbox.scrollTop = chatbox.scrollHeight;
                  }
                } catch (e) {
                  // Ignore JSON parse errors for non-data lines
                }
              }
            }
          });
        }
        if (!reply) reply = '[No response]';
        if (currentBotReply) {
          currentBotReply.innerHTML = marked.parse(reply);
          if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([currentBotReply]);
          }
        }
        chatbox.scrollTop = chatbox.scrollHeight;
        // Add bot reply to history
        chatHistory.push({ role: 'assistant', content: reply });
      } catch (err) {
        resultText.textContent = 'Error: ' + err.message;
      }
    }
  });

  stopBtn.addEventListener('click', function () {
    chatbox.innerHTML = '';
    resultText.textContent = '';
    promptInput.value = '';
    chatHistory.length = 0; // Clear chat history for new conversation
  });

  promptInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateBtn.click();
    }
  });
}); 