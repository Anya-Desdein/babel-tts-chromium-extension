function rerouteToSettings() {
    const removeApiKeyButton = document.getElementById('openAiConfig');    
    removeApiKeyButton.addEventListener('click', function() {
        window.location.href = 'openai_config.html';
    });
}

async function ttsService(apiKey, voiceName) {
    const ttsInputSaveButton = document.getElementById('ttsInputSaveButton');
    const ttsInput = document.getElementById('ttsInput');
    const ttsInputStatusMessage = document.getElementById('ttsInputStatusMessage');

    ttsInputSaveButton.addEventListener('click', async function() {
        const ttsText = ttsInput.value;
        if (!ttsText.length) {
            ttsInputStatusMessage.textContent = 'No input detected.';
            return;
        }

        const messageContents = {
            msgTtsText: ttsText,
            msgApiKey: apiKey, 
            msgVoiceName: voiceName
        };

        chrome.runtime.sendMessage({ action: 'babel_tts_save_text_input', value: messageContents }, (response) => {
            console.log('Response from service worker:', response.status);
        });

        await setToLocalStorage("babel_tts_plain_text", ttsText, ttsInputStatusMessage);
    });
}

async function waitForDom() {
    document.addEventListener('DOMContentLoaded', async function() {
        resultApiKey = await getFromLocalStorage('babel_tts_openai_apikey');
        console.log(resultApiKey)
        if (!resultApiKey) {
            console.log("changing href " + resultApiKey)
            window.location.href = 'set_api_key.html';
        }
        ttsInputStatusMessage.textContent = `${resultApiKey} tts_home.html`;

        resultVoice = await getFromLocalStorage('babel_tts_openai_voice_name');
        if (!resultVoice) {
            await setToLocalStorage("babel_tts_openai_voice_name", 'onyx');
            resultVoice = 'onyx';
        }
        rerouteToSettings()
        ttsService(resultApiKey, resultVoice)
    });
}

waitForDom()
