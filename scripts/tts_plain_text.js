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
            if (response.status == 'success') {
                console.log("Processing started!")
            }
        });
    });
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

function revertResponseToBlob(dataArray, mimeType = 'audio/mpeg') {
    const revUint8Array = new Uint8Array(dataArray);
    const blob = new Blob([revUint8Array], {type: mimeType});
    return blob;
}

function addListenerStartDownloadProcess() {
    saveButton = document.getElementById("ttsOutputSaveButton");
    saveButton.addEventListener('click', async function() {
        chrome.runtime.sendMessage({ action: 'babel_tts_download_mp3', value: "download"}, (response) => {
            const receivedData = response.blob;

            // Due to serialization of sendMessage responses, blob has to be converted to array and then reverted
            const blob = revertResponseToBlob(receivedData);
            const ttsFilename = response.ttsFilename;

            saveResultsToMp3(blob, ttsFilename);
        });
    });
}

async function waitForDom() {
    document.addEventListener('DOMContentLoaded', async function() {
        resultApiKey = await getFromLocalStorage('babel_tts_openai_apikey');

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
        rerouteToSettings();

        ttsService(resultApiKey, resultVoice);
        addListenerForProcessUsIn(saveButton = "ttsOutputSaveButton", playButton = "ttsOutputPlayButton", generateButton = "ttsInputSaveButton", cogButton = "openAiConfig", loadingMsg = "ttsInputStatusMessage");
        addListenerStartDownloadProcess();
    });
}

waitForDom()
