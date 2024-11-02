function getApiKey(callback) {
    chrome.storage.local.get('babel_tts_apiKey', function(result) {
        if (result.babel_tts_apiKey) {
            callback(result.babel_tts_apiKey);
        } else {
            callback('API Key not found');
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const ttsInputSaveButton = document.getElementById('ttsInputSaveButton');
    const ttsInput = document.getElementById('ttsInput');
    const ttsInputStatusMessage = document.getElementById('ttsInputStatusMessage');
    
    ttsInputSaveButton.addEventListener('click', function() {
        const ttsText = ttsInput.value;
        if (!ttsText.length) {
            apiKeyStatusMessage.textContent = 'No input detected.';
        }else {
            getApiKey(function(babel_tts_apiKey) {
                ttsInputStatusMessage.textContent = babel_tts_apiKey;
            });
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