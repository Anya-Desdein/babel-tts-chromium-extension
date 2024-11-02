document.addEventListener('DOMContentLoaded', function() {
    const apiKeySaveButton = document.getElementById('apiKeySaveButton');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const apiKeyStatusMessage = document.getElementById('apiKeyStatusMessage');
    
    apiKeySaveButton.addEventListener('click', function() {
        const apiKey = apiKeyInput.value;
        if (!apiKey.length) {
            apiKeyStatusMessage.textContent = 'No input detected. OpenAI API key is a very long string starting with "sk-". \n Try with that one next time.';
        }else if ((!apiKey.startsWith("sk-")) || (apiKey.length < 5)) {
            apiKeyStatusMessage.textContent = 'This is not an API Key :< . OpenAI API key is a very long string starting with "sk-". \n Try with that one next time.';
        }else {
            chrome.storage.local.set({ babel_tts_openai_apikey: apiKey }, function() {
                window.location.href = 'tts_home.html';
            });
        }
    });
});