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

function previewApiKeyOpenAi(resultApiKeyOpenAI) {
    const hiddenTextField = document.getElementById("hiddenTextContainerAreaApiKey");
    const hiddenTextButton = document.getElementById("hiddenTextContainerButtonApiKey");
    const hiddenTextButtonIcon = document.getElementById("hiddenTextContainerButtonApiKey");

    hiddenTextButtonIcon.style.setProperty('--dynamic-icon-eye', `url(${chrome.runtime.getURL('images/icons/eye_closed.png')})`);

    if (!resultApiKeyOpenAI) {
        hiddenTextField.value = "No OpenAi Api Key.";
        resizeTextArea(hiddenTextField);
        hiddenTextButton.classList.add('missing');
        hiddenTextField.classList.add("missing");
    }

    if (resultApiKeyOpenAI) { 
        hiddenTextField.value = '*'.repeat(resultApiKeyOpenAI.length);
        resizeTextArea(hiddenTextField);
        hiddenTextButton.classList.remove("missing");
        hiddenTextField.classList.remove("missing");
    }

    hiddenTextButton.addEventListener("click", async function () {
        hiddenTextField.classList.toggle("visible");
        closedEyeIcon = await chrome.runtime.getURL("images/themes/images/icons/eye_closed.png");
        openEyeIcon = await chrome.runtime.getURL("images/themes/images/icons/eye_open.png");

        const toggleEyeIcon = hiddenTextButtonIcon.classList.contains("visible")
            ? openEyeIcon
            : closedEyeIcon;

        // TODO: fix icon switch
        const response = await fetch(toggleEyeIcon, { method: 'HEAD' });
        console.log(response);
        hiddenTextButtonIcon.style.setProperty('--dynamic-icon-eye', `url(${toggleEyeIcon})`);

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
    previewApiKeyOpenAi(resultApiKeyOpenAI);

    addListenerReroute("returnHome", "home.html");
    addListenerReroute("configHome", "config_home.html");

    addListenerResizeTextArea("changeApiKeyOpenAiInput");

    addListenerForApiKeyOpenAi("changeApiKeyOpenAiInput", "changeApiKeyOpenAiSaveButton", null, "changeApiKeyOpenAiStatusMessage");
    removeApiKeyOpenAIFromLocalStorageListener();

    pickVoiceOpenAIListener();
}

start()
