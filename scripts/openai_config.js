async function pickVoice() {
    const pickVoiceSaveButton = document.getElementById('pickVoiceSaveButton');
    const pickVoiceStatusMessage = document.getElementById('pickVoiceStatusMessage');

    pickVoiceSaveButton.addEventListener('click', async function() {
        let  pickVoice = document.getElementById('pickVoice');
        pickVoice = pickVoice.value;
        
        if (!pickVoice.length) {
            pickVoiceStatusMessage.textContent = 'Something went wrong. No input detected.';
            return;
        }
        
        if (pickVoice == "alloy" || pickVoice == "echo" || pickVoice == "fable" || pickVoice == "onyx" || pickVoice == "nova" || pickVoice == "shimmer") {
            pickVoiceStatusMessage.textContent = `You picked: ${pickVoice}`;
            await setToLocalStorage("babel_tts_openai_voice_name", pickVoice, pickVoiceStatusMessage);
            return;
        }

        pickVoiceStatusMessage.textContent = `Incorrect value`;
    });
}

async function removeApiKeyFromLocalStorage() {
    const removeApiKeyButton = document.getElementById('removeApiKeyButton');
    const removeApiKeyStatusMessage = document.getElementById('removeApiKeyStatusMessage');
    
    removeApiKeyButton.addEventListener('click', async function() {
        const err = await removeFromLocalStorage("babel_tts_openai_apikey", removeApiKeyStatusMessage);
        if (!err) {
            setTimeout(() => {
                window.location.href = 'set_api_key.html';
            }, 1000);
        }
    });
}

async function changeApiKeyLocalStorage() {
    addListenerForApiKey("changeApiKeyInput", "changeApiKeyButton", null, "changeApiKeyStatusMessage");
}

async function returnFromSettings() {
    const leaveOpenAiConfigButton = document.getElementById('leaveOpenAiConfig');    
    leaveOpenAiConfigButton.addEventListener('click', async function() {
        window.location.href = 'tts_home.html';
    });
}

async function waitForDom() {
    document.addEventListener('DOMContentLoaded', async function() {
        resultApiKey = await getFromLocalStorage('babel_tts_openai_apikey');
        if (!resultApiKey) {
            window.location.href = 'set_api_key.html';
            return;
        }

        removeApiKeyStatusMessage.textContent = `${resultApiKey} openai_config.html`;
        returnFromSettings();
        changeApiKeyLocalStorage();
        removeApiKeyFromLocalStorage();
        pickVoice();
    });
}

waitForDom()
