function rerouteToTts() {
    const removeApiKeyButton = document.getElementById('leaveApiKeySetting');    
    removeApiKeyButton.addEventListener('click', function() {
        window.location.href = 'tts_home.html';
    });
}

function waitForDom() {
    document.addEventListener('DOMContentLoaded', async function() {        
        resultApiKey = await getFromLocalStorage('babel_tts_openai_apikey');
        if (resultApiKey) {
            window.location.href = 'tts_home.html';
            return;
        }
        
        addListenerForApiKey("apiKeyInput", "apiKeySaveButton", 'tts_home.html', "apiKeyStatusMessage");
    });
}

waitForDom()

