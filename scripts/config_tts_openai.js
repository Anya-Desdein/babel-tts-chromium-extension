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

function pickModelOpenAiListener() {
    const pickVoiceSaveButton = document.getElementById('pickModelOpenAiSaveButton');
    const pickVoiceStatusMessage = document.getElementById('pickModelOpenAiStatusMessage');

    pickVoiceSaveButton.addEventListener('click', async function() {
        let  pickVoice = document.getElementById('pickModelOpenAi').value;
        
        if (!pickVoice.length) {
            pickVoiceStatusMessage.style.color = "#9c4b4a";
            pickVoiceStatusMessage.textContent = 'Something went wrong. No input detected.';
            return;
        }
        
        if (pickVoice == "tts-1" || pickVoice == "tts-1-hd") {
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

function setBaseStatePreviewApiKeyOpenAi(resultApiKeyOpenAI = null, hiddenTextField = null, hiddenTextButton = null) {
    if (!resultApiKeyOpenAI) {
        hiddenTextField.value = "No OpenAi Api Key.";
        resizeTextArea(hiddenTextField);

        hiddenTextButton.classList.add('missing');
        hiddenTextField.classList.add("missing");

        const eyeIconPath = 'images/icons/eye_blind.png';
        document.documentElement.style.setProperty('--dynamic-icon-eye', `url(${eyeIconPath})`);

        return;
    }

    hiddenTextField.value = '*'.repeat(resultApiKeyOpenAI.length);
    resizeTextArea(hiddenTextField);
    
    hiddenTextButton.classList.remove("missing");
    hiddenTextField.classList.remove("missing");
    
    const eyeIconPath = 'images/icons/eye_closed.png';
    document.documentElement.style.setProperty('--dynamic-icon-eye', `url(${eyeIconPath})`);
}

function addListenerPreviewApiKeyOpenAi(resultApiKeyOpenAI) {
    const hiddenTextField = document.getElementById("hiddenTextContainerAreaApiKey");
    const hiddenTextButton = document.getElementById("hiddenTextContainerButtonApiKey");

    setBaseStatePreviewApiKeyOpenAi(resultApiKeyOpenAI, hiddenTextField, hiddenTextButton);

    hiddenTextButton.addEventListener("click", async function () {
        hiddenTextField.classList.toggle("visible");
        hiddenTextButton.classList.toggle("visible");

        const eyeIconPath = hiddenTextButton.classList.contains("visible")
            ? 'images/icons/eye_open.png'
            : 'images/icons/eye_closed.png';

        document.documentElement.style.setProperty('--dynamic-icon-eye', `url(${eyeIconPath})`);

        if (hiddenTextField.classList.contains("visible")) {
            hiddenTextField.value = `${resultApiKeyOpenAI}`;
            resizeTextArea(hiddenTextField);
        } else {
            hiddenTextField.value = '*'.repeat(resultApiKeyOpenAI.length);
            resizeTextArea(hiddenTextField);
        }
    });
}

async function start() {
    setWallpaperFromChromeLocalStorage();

    resultApiKeyOpenAI = await getFromLocalStorage('babel_tts_openai_apikey');
    addListenerPreviewApiKeyOpenAi(resultApiKeyOpenAI);

    addListenerReroute("returnHome", "home.html");
    addListenerReroute("configHome", "config_home.html");

    addListenerResizeTextArea("changeApiKeyOpenAiInput");

    addListenerForApiKeyOpenAi("changeApiKeyOpenAiInput", "changeApiKeyOpenAiSaveButton", null, "changeApiKeyOpenAiStatusMessage");
    removeApiKeyOpenAIFromLocalStorageListener();

    pickVoiceOpenAIListener();
}

start()
