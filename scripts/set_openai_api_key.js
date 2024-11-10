function waitForDom() {
    document.addEventListener('DOMContentLoaded', async function() {        
        resultApiKey = await getFromLocalStorage('babel_tts_openai_apikey');
        if (resultApiKey) {
            window.location.href = 'home.html';
            return;
        }
        
        addListenerForApiKey("apiKeyOpenAiInput", "apiKeyOpenAiSaveButton", 'home.html', "apiKeyOpenAiStatusMessage");
    });
}

waitForDom()

