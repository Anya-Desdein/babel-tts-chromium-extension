function getValueFromLocalStorage(callback) {
    chrome.storage.local.get(function(result) {
        callback(result.babel_tts_apiKey || `${value} not found`);
    });
}

function saveFormData(text) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ babel_tts_plain_text: text }, function()  {
            if (chrome.runtime.lastError) {
                reject(new Error('Failed to save data'));
            } else {
                resolve('Data saved successfully');
            }
        });
    });
}

function tts_service(apiKey) {
    const ttsInputSaveButton = document.getElementById('ttsInputSaveButton');
    const ttsInput = document.getElementById('ttsInput');
    const ttsInputStatusMessage = document.getElementById('ttsInputStatusMessage');

    ttsInputSaveButton.addEventListener('click', function() {
        const ttsText = ttsInput.value;

        if (!ttsText.length) {
            ttsInputStatusMessage.textContent = 'No input detected.';
        } else {
            saveFormData(ttsText)
                .then((return_value) => {
                    ttsInputStatusMessage.textContent = return_value;
                });
        }
    });
}

function remove_api_key() {
    const removeApiKeyButton = document.getElementById('removeApiKeyButton');
    const removeApiKeyStatusMessage = document.getElementById('removeApiKeyStatusMessage');
    
    removeApiKeyButton.addEventListener('click', function() {
        try {
            localStorage.removeItem('babel_tts_apiKey')
            removeApiKeyStatusMessage.textContent = 'API KEY Removed';
            setTimeout(() => {
                window.location.href = 'set_api_key.html';
            }, 1000);

        } catch (error) {
            removeApiKeyStatusMessage.textContent = `${error}`
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    getValueFromLocalStorage(function(apiKey) {
        if (!apiKey) {
            setTimeout(() => {
                ttsInputStatusMessage.textContent = 'set_api_key.html';
                window.location.href = 'set_api_key.html';
            }, 1000);
        }else {
            ttsInputStatusMessage.textContent = `${apiKey} tts_home.html`;
            remove_api_key();
            tts_service(apiKey);
        }
    });
});

/*
document.getElementById("generateTTS").addEventListener("click", async function() {
    const ttsInput = document.getElementById("ttsInput").value;

    chrome.storage.local.get("openaiApiKey", async function(result) {
        const apiKey = result.openaiApiKey;

        if (!apiKey) {
            document.getElementById("statusMessage").textContent = "API Key not found. Please enter it above.";
            return;
        }

        try {
            // Fetch TTS audio from OpenAI API
            const response = await fetch("https://api.openai.com/v1/audio/speech", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "tts-1",
                    voice: "onyx",
                    input: ttsInput
                })
            });

            if (!response.ok) {
                throw new Error("Failed to generate speech.");
            }

            const blob = await response.blob();

            // Prompt the user to save the audio file
            const saveFileHandle = await window.showSaveFilePicker({
                suggestedName: "output.mp3",
                types: [{
                    description: "Audio Files",
                    accept: { "audio/mpeg": [".mp3"] }
                }]
            });

            const writableStream = await saveFileHandle.createWritable();
            await writableStream.write(blob);
            await writableStream.close();

            document.getElementById("statusMessage").textContent = "Speech synthesis complete. File saved.";
        } catch (error) {
            console.error("Error generating TTS:", error);
            document.getElementById("statusMessage").textContent = "Failed to generate speech.";
        }
    });
});
*/