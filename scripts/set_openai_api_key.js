async function addApiKeyToLocalVariables(errTargetName=null) {
    document.addEventListener('DOMContentLoaded', async function() {
        const apiKeySaveButton = document.getElementById('apiKeySaveButton');
        const apiKeyInput = document.getElementById('apiKeyInput');
        const errTarget = document.getElementById(errTargetName);

        await apiKeySaveButton.addEventListener('click', async function() {
            const apiKey = apiKeyInput.value;
            if (!apiKey.length) {
                errTarget.textContent = 'No input detected. OpenAI API key is a very long string starting with "sk-". \n Try with that one next time.';
            }else if ((!apiKey.startsWith("sk-")) || (apiKey.length < 5)) {
                errTarget.textContent = 'This is not an API Key :< . OpenAI API key is a very long string starting with "sk-". \n Try with that one next time.';
            }else {
                const err = await setToLocalStorage('babel_tts_openai_apikey', apiKey, errTarget);
                if (!err) {
                    window.location.href = 'tts_home.html';
                }
            }
        });
    });
}

addApiKeyToLocalVariables("apiKeyStatusMessage");