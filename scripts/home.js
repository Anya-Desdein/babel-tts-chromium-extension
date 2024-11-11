async function ttsService(apiKey, voiceName, saveButtonName, ttsInputName, ttsInputStatusMessageName) {
    const ttsInputSaveButton = document.getElementById(saveButtonName);
    const ttsInput = document.getElementById(ttsInputName);
    const ttsInputStatusMessage = document.getElementById(ttsInputStatusMessageName);

    ttsInputSaveButton.addEventListener('click', async function() {
        const ttsText = ttsInput.value;
        if (!ttsText.length) {
            ttsInputStatusMessage.style.color = "rgb(164, 48, 48)";
            ttsInputStatusMessage.textContent = 'No input detected.';
            return;
        }

        const messageContents = {
            msgTtsText: ttsText,
            msgApiKey: apiKey, 
            msgVoiceName: voiceName
        };

        chrome.runtime.sendMessage({ action: 'babel_tts_save_text_input_tts_openai', value: messageContents }, (response) => {
            if (response.status == 'success') {
                console.log("Processing started!")
            }
        });
    });
}

function addListenerForApiKey(apiKeyOpenAiInputName, apiKeySaveButtonName, returnAddr=null ,errTargetName=null) {
    const apiKeyOpenAiInput = document.getElementById(apiKeyOpenAiInputName);
    const apiKeySaveButton = document.getElementById(apiKeySaveButtonName);
    const errTarget = document.getElementById(errTargetName);

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
    saveButton = document.getElementById("ttsOutputSaveButtonOpenAi");
    saveButton.addEventListener('click', async function() {
        chrome.runtime.sendMessage({ action: 'babel_tts_download_mp3_tts_openai', value: "download"}, (response) => {
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
        setWallpaperFromChromeLocalStorage();

        resultApiKeyOpenAI = await getFromLocalStorage('babel_tts_openai_apikey');
        if (!resultApiKeyOpenAI) {
            changeStateText("noApiKey", 'ttsInputStatusMessageOpenAi');
            changeStateButton("noApiKey", 'ttsInputSaveButtonOpenAi');
          
            changeStateHiddenButton("noApiKey", 'ttsOutputSaveButtonOpenAi');   
            changeStateHiddenButton("noApiKey", 'ttsOutputPlayButtonOpenAi');
        }

        resultVoice = await getFromLocalStorage('babel_tts_openai_voice_name');
        if (!resultVoice) {
            await setToLocalStorage("babel_tts_openai_voice_name", 'onyx');
            resultVoice = 'onyx';
        }

        createRouterListener("configHome", "config_home.html");
        
        addListenerResizeTextArea("ttsInputOpenAi");

        ttsService(resultApiKeyOpenAI, resultVoice, "ttsInputSaveButtonOpenAi", "ttsInputOpenAi", "ttsInputStatusMessageOpenAi");
        addListenerStateChangeFromBackground(saveButton = "ttsOutputSaveButtonOpenAi", playButton = "ttsOutputPlayButtonOpenAi", generateButton = "ttsInputSaveButtonOpenAi", textMsg = "ttsInputStatusMessageOpenAi");
        addListenerStartDownloadProcess();

    });
}

waitForDom()
