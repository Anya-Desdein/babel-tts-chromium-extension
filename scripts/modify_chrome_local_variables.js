async function getFromLocalStorage(value) {
    let result = await chrome.storage.local.get(value);
    result = result[value];
    if (!result) {
        return null;
    }
    
    if (!(typeof result === 'string')){
        result = JSON.stringify(result);
    }
    return result;
}

async function setToLocalStorage(key, value, errTarget=null) {
    await chrome.storage.local.set({ [key]: value });
    result = await getFromLocalStorage(key);

    if (!result) {
        if (errTarget) {
            errTarget.textContent = "Something went wrong. Key not in local storage.";
        }
        return key;
    }

    if (errTarget) {
        errTarget.textContent = `Value ${result} saved under key ${key}`;
    }
    return null;
}

async function removeFromLocalStorage(key, errTarget=null) {
    await chrome.storage.local.remove(key);
    result = await getFromLocalStorage(key);

    if (!result) {
        if (errTarget) {
            errTarget.textContent = "Key removed from local storage.";
        }
        return null;
    }
    if (errTarget) {
        errTarget.textContent = `Something went wrong. Value ${result} still exists under key ${key}`;
    }
    return key;
}

function addListenerForApiKey(apiKeyInputName, apiKeySaveButtonName, returnAddr=null ,errTargetName=null) {
    const apiKeyInput      = document.getElementById(apiKeyInputName);
    const apiKeySaveButton = document.getElementById(apiKeySaveButtonName);
    const errTarget        = document.getElementById(errTargetName);

    apiKeySaveButton.addEventListener('click', async function() {
        const apiKey = apiKeyInput.value;
        
        if (!apiKey.length) {
            errTarget.textContent = 'No input detected. OpenAI API key is a very long string starting with "sk-". \n Try with that one next time.';
            return;
        }
        
        if ((!apiKey.startsWith("sk-")) || (apiKey.length < 5)) {
            errTarget.textContent = 'This is not an API Key :< . OpenAI API key is a very long string starting with "sk-". \n Try with that one next time.';
            return;
        }

        err = await setToLocalStorage('babel_tts_openai_apikey', apiKey, errTarget);
        if (!err && returnAddr) {
            window.location.href = returnAddr;
        }
    });
}

function addListenerForProcessUsIn(saveButton = null, playButton = null, generateButton = null, cogButton = null, loadingMsg = null) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (!(request.action === 'babel_tts_start_generating_file')){
            return;
        }
      
        if (request.value == "no") {
            document.getElementById(loadingMsg).textContent = "";

            document.getElementById(saveButton).disabled = false;
            document.getElementById(saveButton).style.visibility = 'hidden';
    
            document.getElementById(playButton).disabled = false;
            document.getElementById(playButton).style.visibility = 'hidden';
    
            document.getElementById(generateButton).disabled = false;
    
            document.getElementById(cogButton).disabled = false;     
            return;
        }

        if (request.value == "processing") {
            document.getElementById(loadingMsg).textContent = "Processing in Progress.";
    
            document.getElementById(saveButton).disabled = true;
            document.getElementById(saveButton).style.visibility = 'visible';
    
            document.getElementById(playButton).disabled = true;
            document.getElementById(playButton).style.visibility = 'visible';

            document.getElementById(generateButton).disabled = true;
    
            document.getElementById(cogButton).disabled = true;      
            return;
        }

        document.getElementById(loadingMsg).textContent = "";

        document.getElementById(saveButton).disabled = false;
        document.getElementById(saveButton).style.visibility = 'visible';

        document.getElementById(playButton).disabled = false;
        document.getElementById(playButton).style.visibility = 'visible';

        document.getElementById(generateButton).disabled = false;

        document.getElementById(cogButton).disabled = false;    
      });
}

async function saveResultsToMp3(blob, ttsFilename) {
    const saveFileHandle = await window.showSaveFilePicker({
      suggestedName: ttsFilename,
        types: [{
          description: "Audio Files",
          accept: { "audio/mpeg": [".mp3"] }
        }]
    })
    const writableStream = await saveFileHandle.createWritable();
    
    if (!blob) {
        chrome.runtime.sendMessage({ action: 'babel_tts_start_generating_file', value: "no" });
        return;
    }

    await writableStream.write( blob );
    await writableStream.close();
    chrome.runtime.sendMessage({ action: 'babel_tts_start_generating_file', value: "yes" });
  }