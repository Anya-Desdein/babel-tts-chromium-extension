async function start() {
    setWallpaperFromChromeLocalStorage();
    resultApiKeyOpenAI = await getFromLocalStorage('babel_tts_openai_apikey');
    if (!resultApiKeyOpenAI) {
        sendStateToBackgroundWorker("noApiKey", 'ttsOutputSaveButtonOpenAi', "ttsPlayerControls", "ttsInputSaveButtonOpenAi", "ttsInputStatusMessageOpenAi");
    }

    resultVoice = await getFromLocalStorage('babel_tts_openai_voice_name');
    if (!resultVoice) {
        await setToLocalStorage("babel_tts_openai_voice_name", 'onyx');
        resultVoice = 'onyx';
    }

    addListenerReroute("configHome", "config_home.html");       
    addListenerResizeTextArea("ttsInputOpenAi");

    // ttsService(resultApiKeyOpenAI, resultVoice, "ttsInputSaveButtonOpenAi", "ttsInputOpenAi", "ttsInputStatusMessageOpenAi");
    // addListenerChangeStateFromBackground(saveButton = "ttsOutputSaveButtonOpenAi", generateButton = "ttsInputSaveButtonOpenAi", textMsg = "ttsInputStatusMessageOpenAi", player = "ttsPlayerControls",  blobExists = true);
        
    // addListenerStartDownloadProcess();
}

start()
