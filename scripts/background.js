let savedTTSInput = '';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!(request.action === 'babel_tts_save_text_input')){
    return;
  }

        savedTTSInput = request.value;
        sendResponse({ status: 'success' });
});
