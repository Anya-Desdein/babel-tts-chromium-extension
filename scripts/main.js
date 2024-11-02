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
            chrome.storage.local.set({ babel_tts_apiKey: apiKey }, function() {
                apiKeyStatusMessage.textContent = 'API Key saved successfully!';

                setTimeout(() => {
                    window.location.href = 'tts_home.html';
                }, 1000); // Delay to show the success message briefly
            });
        }
    });

    
    // Function to retrieve the API key
    function getApiKey(callback) {
        chrome.storage.local.get('babel_tts_apiKey', function(result) {
            if (result.babel_tts_apiKey) {
                callback(result.babel_tts_apiKey);
            } else {
                console.log('API Key not found');
            }
        });
    }
    
    // Example usage of getApiKey function
    getApiKey(function(babel_tts_apiKey) {
        console.log('Retrieved API Key:', babel_tts_apiKey);
        // You can use the apiKey here for any additional logic or API calls
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