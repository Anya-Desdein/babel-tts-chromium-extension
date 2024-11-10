function rerouteToSettings() {
    const removeApiKeyButton = document.getElementById('openAiConfig');    
    removeApiKeyButton.addEventListener('click', function() {
        window.location.href = 'openai_config.html';
    });
}

async function ttsService(apiKey, voiceName, saveButtonName, ttsInputName, ttsInputStatusMessageName) {


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
            if (response.status == 'success') {
                console.log("Processing started!")
            }
        });
    });
}

function addListenerForApiKey(apiKeyOpenAiInputName, apiKeySaveButtonName, returnAddr=null ,errTargetName=null) {
    const apiKeyOpenAiInput      = document.getElementById(apiKeyOpenAiInputName);
    const apiKeySaveButton = document.getElementById(apiKeySaveButtonName);
    const errTarget        = document.getElementById(errTargetName);

    apiKeySaveButton.addEventListener('click', async function() {
        const apiKey = apiKeyOpenAiInput.value;
        
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

function addListenerResizeTextArea(textAreaId) {
    const textarea = document.getElementById(textAreaId);

    textarea.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
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
        const ttsInputSaveButtonOpenAi = document.getElementById('ttsInputSaveButtonOpenAi');
        const ttsInpuOpenAi = document.getElementById('ttsInputOpenAi');
        const ttsInputStatusMessageOpenAi = document.getElementById('ttsInputStatusMessageOpenAi');
        resultApiKeyOpenAI = await getFromLocalStorage('babel_tts_openai_apikey');

        if (!resultApiKeyOpenAI) {
            window.location.href = 'set_api_key.html';
        }
        
        resultVoice = await getFromLocalStorage('babel_tts_openai_voice_name');
        if (!resultVoice) {
            await setToLocalStorage("babel_tts_openai_voice_name", 'onyx');
            resultVoice = 'onyx';
        }
        rerouteToSettings();
        addListenerResizeTextArea("ttsInput");


        ttsService(resultApiKeyOpenAI, resultVoice, ttsInputSaveButtonOpenAi, ttsInpuOpenAi, ttsInputStatusMessageOpenAi);
        addListenerForProcessUsIn(saveButton = "ttsOutputSaveButton", playButton = "ttsOutputPlayButton", generateButton = "ttsInputSaveButton", cogButton = "openAiConfig", loadingMsg = "ttsInputStatusMessage");
        addListenerStartDownloadProcess();

    });
}

waitForDom()
