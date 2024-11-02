function getValueFromLocalStorage(value, callback) {
    chrome.storage.local.get(value, function(result) {
        callback( JSON.stringify(result[value]) || `${result} not found`);
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

function ttsService(apiKey) {
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
                    sendRequestToOpenai(ttsText, apiKey);
                });
        }
    });
}

function rerouteToSettings() {
    const removeApiKeyButton = document.getElementById('openAiConfig');    
    removeApiKeyButton.addEventListener('click', function() {
        window.location.href = 'openai_config.html';
    });
}

async function sendRequestToOpenai(text, apiKey) {
    try {
        const response = await fetch("https://api.openai.com/v1/audio/speech", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "tts-1",
                voice: "onyx",
                input: text
            })
        })
        if (!response.ok) {
            throw new Error(`Invalid Response. Response: ${response} Ok: ${response.ok}`);
        }else {
            const blob = await response.blob()
            const saveFileHandle = await window.showSaveFilePicker({
                suggestedName: "output.mp3",
                types: [{
                    description: "Audio Files",
                    accept: { "audio/mpeg": [".mp3"] }
                }]
            })
            const writableStream = await saveFileHandle.createWritable();
            await writableStream.write(blob);
            await writableStream.close()
            document.getElementById("statusMessage").textContent = "Saved to a file.";
        }
    } catch (error) {
        console.error("Error generating TTS:", error);
        document.getElementById("statusMessage").textContent = `Failed to generate. Error: ${error}`;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    getValueFromLocalStorage("babel_tts_openai_apikey", function(apiKey) {
        if (!apiKey) {
            window.location.href = 'set_api_key.html';
        }else {
            ttsInputStatusMessage.textContent = `${apiKey} tts_home.html`;
            rerouteToSettings()
            ttsService(apiKey);
        }
    });
});