function changeStateText(state, elementName) {
  element = document.getElementById(elementName);

  if (state == "no") {
    element.textContent = "";   
    return;
  }

  if (state == "processing") {
    element.textContent = "Processing in Progress.";   
    return;
  }

  if (state == "noApiKey") {
    element.textContent = "No or invalid OpenAi Api Key, please add it before generating";
    return;
  }

  element.textContent = "";
}

function changeStateButton(state, elementName) {
  element = document.getElementById(elementName);

  if (state == "no") {
    element.disabled = false;
    return;
  }

  if (state == "processing" || state == "noApiKey") {
    element.disabled = true;    
    return;
  }

  element.disabled = false;
}

function changeStateHiddenButton(state, elementName) {
  element = document.getElementById(elementName);

  if (state == "no") {
    element.disabled = false;
    element.style.visibility = 'hidden'; 
    return;
  }

  if (state == "processing") {
    element.disabled = true;
    element.style.visibility = 'visible';     
    return;
  }

  if (state == "noApiKey") {
    element.disabled = true;
    return;
  }

  element.disabled = false;
  element.style.visibility = 'visible';  
}

function setButtonStates(state, saveButton = null, playButton = null, generateButton = null, textMsg = null) {
  if (!state) {
    return;
  }

  if (textMsg) {
    changeStateText(state, textMsg);
  }

  if (generateButton) {
    changeStateButton(state, generateButton);  
  }

  if (saveButton) {
    changeStateHiddenButton(state, saveButton);  
  }

  if (playButton) {
    changeStateHiddenButton(state, playButton);  
  }
}

function addListenerChangeStateFromBackground(saveButton = null, playButton = null, generateButton = null, textMsg = null) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (!(request.action === 'babel_tts_start_generating_file_tts_openai')){
            return;
        }

        const allowedProcessingStates = ['processing', 'yes', 'no', 'noApiKey'];
        if (!allowedProcessingStates.includes(request.value)) {
          return;
        }
      
        setButtonStates(request.value, saveButton, playButton, generateButton, textMsg);
      });
}

function sendStateToBackgroundWorker(state, saveButton = null, playButton = null, generateButton = null, textMsg = null) {
  setButtonStates(state, saveButton, playButton, generateButton, textMsg);
  chrome.runtime.sendMessage({ action: 'babel_tts_change_key_state_tts_openai', value: state });
}