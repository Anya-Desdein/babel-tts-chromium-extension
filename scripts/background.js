function checkForChanges() {
  if (previousValue == savedTtsInput) {
    return;
  }

  console.log('Value changed from', previousValue, 'to', savedTtsInput);
  previousValue = savedTtsInput;

  

}

let previousValue = '';
let savedTtsInput = '';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!(request.action === 'babel_tts_save_text_input')){
    return;
  }

        savedTtsInput = request.value;
        sendResponse({ status: 'success' });
});


const interval = 5000;
setInterval(checkForChanges, interval);