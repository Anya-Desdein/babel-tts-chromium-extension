async function addApiKeyToLocalVariables(apiKeyInputName, apiKeySaveButtonName, errTargetName=null) {
    const apiKeyInput = document.getElementById(apiKeyInputName);
    const apiKeySaveButton = document.getElementById(apiKeySaveButtonName);
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
}

async function waitForDom() {
    await document.addEventListener('DOMContentLoaded', async function() {        
        resultApiKey = await getFromLocalStorage('babel_tts_openai_apikey');
        if (resultApiKey) {
            window.location.href = 'tts_home.html';
        } else {
            await addApiKeyToLocalVariables("apiKeyInput", "apiKeySaveButton", "apiKeyStatusMessage");
        }
    });
}

waitForDom()

