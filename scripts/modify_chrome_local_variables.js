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
    console.log(typeof key, key);
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