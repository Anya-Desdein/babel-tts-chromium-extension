function changeStateText(state, elementName, errMessage="OOPSIE wOOPSIE! UwU We made a fucky wucky!") {
  element = document.getElementById(elementName);

  if (state == "noProcessing") {
    element.textContent = "";   
    return;
  }

  if (state == "processingInProgress") {
    element.textContent = "Processing in Progress.";   
    return;
  }

  /*
  if (state == "finishedProcessing") {
    element.textContent = "";   
    return;
  }
  */

  if (state == "noApiKey") {
    element.textContent = "No or invalid OpenAi Api Key, please add it before generating";
    return;
  }

  if (state == "requestErr") {
    element.textContent = `Error: ${errMessage}`;
    return;
  }

  element.textContent = "";   
}

function changeStateButton(state, elementName) {
  element = document.getElementById(elementName);

  if (state == "processingInProgress" || state == "finishedProcessing" || state == "noApiKey" || state == "noApiKey") {
    element.disabled = true;    
    return;
  }

  element.disabled = false;
}

function changeStateHiddenButton(state, elementName) {
  element = document.getElementById(elementName);

  if (state == "noProcessing") {
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

function setButtonStates(state, saveButton = null, generateButton = null, textMsg = null, player = null, blobExists = false) {
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

  if (player) {
      playerToggle(player, blobExists);
  }
}

function addListenerChangeStateFromBackground(saveButton = null, generateButton = null, textMsg = null, player = null, blobExists = false) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (!(request.action === 'babel_tts_start_generating_file_tts_openai')){
            return;
        }

        const allowedProcessingStates = ['processing', 'yes', 'no', 'noApiKey'];
        if (!allowedProcessingStates.includes(request.value)) {
          return;
        }
      
        setButtonStates(request.value, saveButton, generateButton, textMsg, player, blobExists);
        askForBlobToObjectUrl("ttsPlayerControls");
      });
}

function sendStateToBackgroundWorker(state, saveButton = null, generateButton = null, textMsg = null, player = null, blobExists = false) {
  setButtonStates(state, saveButton, generateButton, textMsg, player, blobExists);
  chrome.runtime.sendMessage({ action: 'babel_tts_change_key_state_tts_openai', value: state });
}