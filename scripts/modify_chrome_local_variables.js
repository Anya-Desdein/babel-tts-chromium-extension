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
    key = key.trim();
    value = value.trim();
    await chrome.storage.local.set({ [key]: value });
    result = await getFromLocalStorage(key);

    if (!result) {
        if (errTarget) {
            errTarget.style.color = "#9c4b4a";
            errTarget.textContent = "Something went wrong. Element hasn't been saved.";
        }
        return key;
    }

    if (errTarget) {
        errTarget.style.color = " #d8cbc2";
        errTarget.textContent = `Saved Successfully.`;
    }
    return null;
}

async function removeFromLocalStorage(key, errTarget=null) {
    await chrome.storage.local.remove(key);
    result = await getFromLocalStorage(key);

    if (!result) {
        return null;
    }

    if (errTarget) {
        errTarget.textContent = `Something went wrong. Value ${result} still exists under key ${key}.`;
    }
    return key;
}

function addListenerForApiKeyOpenAi(apiKeyOpenAiInputName, apiKeyOpenAiSaveButtonName, returnAddr=null , errTargetName=null) {
    const apiKeyOpenAiInput      = document.getElementById(apiKeyOpenAiInputName);
    const apiKeyOpenAiSaveButton = document.getElementById(apiKeyOpenAiSaveButtonName);
    const errTarget              = document.getElementById(errTargetName);

    console.log(apiKeyOpenAiInput);
    apiKeyOpenAiSaveButton.addEventListener('click', async function() {
        const apiKey = apiKeyOpenAiInput.value;
        
        if (!apiKey.length) {
            errTarget.style.color = "#9c4b4a";
            errTarget.textContent = 'No input detected. OpenAI API key is a very long string starting with "sk-". \n Try with that one next time.';
            return;
        }
        
        if ((!apiKey.startsWith("sk-")) || (apiKey.length < 5)) {
            errTarget.style.color = "#9c4b4a";
            errTarget.textContent = 'This is not an API Key :< . OpenAI API key is a very long string starting with "sk-". \n Try with that one next time.';
            return;
        }

        err = await setToLocalStorage('babel_tts_openai_apikey', apiKey, errTarget);
        if (!err) {
            sendStateToBackgroundWorker("no");
        }

        if (!err && returnAddr) {
            window.location.href = returnAddr;
        }
    });
}