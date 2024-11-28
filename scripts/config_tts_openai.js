function pickVoiceOpenAIListener() {
    const pickVoiceSaveButton = document.getElementById('pickVoiceOpenAiSaveButton');
    const pickVoiceStatusMessage = document.getElementById('pickVoiceOpenAiStatusMessage');

    pickVoiceSaveButton.addEventListener('click', async function() {
        let  pickVoice = document.getElementById('pickVoiceOpenAi').value;
        
        if (!pickVoice.length) {
            pickVoiceStatusMessage.style.color = "#9c4b4a";
            pickVoiceStatusMessage.textContent = 'Something went wrong. No input detected.';
            return;
        }
        
        if (pickVoice == "alloy" || pickVoice == "echo" || pickVoice == "fable" || pickVoice == "onyx" || pickVoice == "nova" || pickVoice == "shimmer") {
            await setToLocalStorage("babel_tts_openai_voice_name", pickVoice, pickVoiceStatusMessage);
            return;
        }

        pickVoiceStatusMessage.style.color = "#9c4b4a";
        pickVoiceStatusMessage.textContent = "Something went wrong. Incorrect input.";
    });
}

function removeApiKeyOpenAIFromLocalStorageListener() {
    const removeApiKeyButton = document.getElementById('removeApiKeyOpenAiSaveButton');
    const removeApiKeyStatusMessage = document.getElementById('removeApiKeyOpenAiStatusMessage');
    
    removeApiKeyButton.addEventListener('click', async function() {
        const err = await removeFromLocalStorage("babel_tts_openai_apikey", removeApiKeyStatusMessage);
        if (!err) {
            removeApiKeyStatusMessage.style.color = "#d8cbc2";
            removeApiKeyStatusMessage.textContent = `Key Removed.`;

            const trickyAddApiKeyStatusMEssage = document.getElementById("changeApiKeyOpenAiStatusMessage");
            trickyAddApiKeyStatusMEssage.style.color = "#9c4b4a";;
            trickyAddApiKeyStatusMEssage.textContent = "No OpenAi Api Key, please add it here.";
            
            sendStateToBackgroundWorker("noApiKey");
        }
    });
}

function previewApiKeyOpenAiOld(resultApiKeyOpenAI) {
    const ttsInputStatusMessageOpenAi = document.getElementById('changeApiKeyOpenAiStatusMessage');
    if (!resultApiKeyOpenAI) {
        ttsInputStatusMessageOpenAi.style.color = "#9c4b4a";
        ttsInputStatusMessageOpenAi.textContent = "No OpenAi Api Key, please add it here.";
    } else {
        ttsInputStatusMessageOpenAi.style.color = " #d8cbc2";
        ttsInputStatusMessageOpenAi.textContent = `${resultApiKeyOpenAI}`;
    }
}

function previewApiKeyOpenAi(resultApiKeyOpenAI) {
    const hiddenTextField = document.getElementById("hiddenTextContainerAreaApiKey");
    const hiddenTextButton = document.getElementById("hiddenTextContainerButtonApiKey");
    const hiddenTextButtonIcon = document.getElementById("hiddenTextContainerButtonApiKey");

    if (!resultApiKeyOpenAI) {
        hiddenTextField.value = "No OpenAi Api Key.";
        resizeTextArea(hiddenTextField);
        hiddenTextButton.classList.add('missing');
        hiddenTextField.classList.add("missing");
    }

    if (resultApiKeyOpenAI) { 
        hiddenTextField.value = [...resultApiKeyOpenAI].map(char => "*").join('');
        resizeTextArea(hiddenTextField);
        hiddenTextButton.classList.remove("missing");
        hiddenTextField.classList.remove("missing");
    }

    hiddenTextButton.addEventListener("click", function () {
        hiddenTextField.classList.toggle("visible");

        if (hiddenTextField.classList.contains("visible")) {
            hiddenTextField.value = `${resultApiKeyOpenAI}`;
            resizeTextArea(hiddenTextField);
        } else {
            hiddenTextField.value = [...resultApiKeyOpenAI].map(char => "*").join('');
            resizeTextArea(hiddenTextField);
        }
    });
}

async function start() {
    setWallpaperFromChromeLocalStorage();

    resultApiKeyOpenAI = await getFromLocalStorage('babel_tts_openai_apikey');
    previewApiKeyOpenAi(resultApiKeyOpenAI);

    addListenerReroute("returnHome", "home.html");
    addListenerReroute("configHome", "config_home.html");

    addListenerResizeTextArea("changeApiKeyOpenAiInput");

    addListenerForApiKeyOpenAi("changeApiKeyOpenAiInput", "changeApiKeyOpenAiSaveButton", null, "changeApiKeyOpenAiStatusMessage");
    removeApiKeyOpenAIFromLocalStorageListener();

    pickVoiceOpenAIListener();
}

start()
