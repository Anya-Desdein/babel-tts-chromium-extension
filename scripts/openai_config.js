function getValueFromLocalStorage(value, callback) {
    chrome.storage.local.get(value, function(result) {
        callback( JSON.stringify(result[value]) || false);
    });
}

function saveSettings(key, value) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ [key]: value }, function()  {
            if (chrome.runtime.lastError) {
                reject(new Error(`Failed to save to ${key}`));
            } else {
                getValueFromLocalStorage(key, function(result) {
                    if (!result) {
                        pickVoiceStatusMessage.textContent = 'Something went wrong. No key in the local storage.';
                    }else {
                        pickVoiceStatusMessage.textContent = `Result saved, ${result}`;
                    }
                });
                resolve('Saved successfully');
            }
        });
    });
}

function pickVoice() {
    let  pickVoice = document.getElementById('pickVoice');
    pickVoice = pickVoice.value;
    const pickVoiceSaveButton = document.getElementById('pickVoiceSaveButton');
    const pickVoiceStatusMessage = document.getElementById('pickVoiceStatusMessage');

    pickVoiceSaveButton.addEventListener('click', function() {
        try {
            if (!pickVoice.length) {
                pickVoiceStatusMessage.textContent = 'Something went wrong. No input detected.';
            }else if (pickVoice == "alloy" || pickVoice == "echo" || pickVoice == "fable" || pickVoice == "onyx" || pickVoice == "nova" || pickVoice == "shimmer") {
                pickVoiceStatusMessage.textContent = `You picked: ${pickVoice}`;
                saveSettings('babel_tts_openai_voice_name', pickVoice);
            }else {
                pickVoiceStatusMessage.textContent = `Incorrect value`;
            }
        } catch (error) {
            pickVoiceStatusMessage.textContent = `${error}`
        }
    });
}

function removeApiKey() {
    const removeApiKeyButton = document.getElementById('removeApiKeyButton');
    const removeApiKeyStatusMessage = document.getElementById('removeApiKeyStatusMessage');
    
    removeApiKeyButton.addEventListener('click', function() {
        try {
            localStorage.removeItem('babel_tts_openai_apikey')
            removeApiKeyStatusMessage.textContent = 'API KEY Removed';
            setTimeout(() => {
                window.location.href = 'set_api_key.html';
            }, 1000);

        } catch (error) {
            removeApiKeyStatusMessage.textContent = `${error}`
        }
    });
}

function returnFromSettings() {
    const removeApiKeyButton = document.getElementById('leaveOpenAiConfig');    
    removeApiKeyButton.addEventListener('click', function() {
        window.location.href = 'tts_home.html';
    });
}

document.addEventListener('DOMContentLoaded', function() {
    getValueFromLocalStorage('babel_tts_openai_apikey', function(apiKey) {
        if (!apiKey) {
            window.location.href = 'set_api_key.html';
        }else {
            removeApiKeyStatusMessage.textContent = `${apiKey} openai_config.html`;
            returnFromSettings();
            removeApiKey();
            pickVoice();
        }
    });
});