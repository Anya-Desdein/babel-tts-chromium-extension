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

function ttsService(apiKey, voiceName) {
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
                    sendRequestToOpenai(ttsText, apiKey, voiceName);
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

async function sendRequestToOpenai(text, apiKey, voiceName) {
    try {
        apiKey = apiKey.replace(/^['"]|['"]$/g, '');
        voiceName = voiceName.replace(/^['"]|['"]$/g, '');
        console.log(`${text}, ${apiKey}, ${voiceName}.`);

        let stringified_text = String(text);
        stringified_text = stringified_text.replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g , '_').slice(0, 22) + ".mp3";
        stringified_text = stringified_text.length <= 7 ? "output.mp3" : stringified_text;
        console.log(`${stringified_text}`);

        const response = await fetch("https://api.openai.com/v1/audio/speech", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "tts-1",
                voice: voiceName,
                input: text
            })
        })
        if (!response.ok) {
            throw new Error(`Invalid Response. Response: ${response} Ok: ${response.ok}`);
        }else {
            const blob = await response.blob()
            const saveFileHandle = await window.showSaveFilePicker({
                suggestedName: stringified_text,
                types: [{
                    description: "Audio Files",
                    accept: { "audio/mpeg": [".mp3"] }
                }]
            })
            const writableStream = await saveFileHandle.createWritable();
            await writableStream.write(blob);
            await writableStream.close()
            document.getElementById("ttsInputStatusMessage").textContent = "Saved to a file.";
        }
    } catch (error) {
        console.error("Error generating TTS:", error);
        document.getElementById("ttsInputStatusMessage").textContent = `Failed to generate. Error: ${error}`;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    getValueFromLocalStorage("babel_tts_openai_apikey", function(apiKey) {
        if (!apiKey) {
            window.location.href = 'set_api_key.html';
        }else {
            getValueFromLocalStorage("babel_tts_openai_voice_name", function(voiceName) {
                rerouteToSettings()
                ttsService(apiKey, voiceName);
            });
        }
    });
});