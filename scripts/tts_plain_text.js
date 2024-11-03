function rerouteToSettings() {
    const removeApiKeyButton = document.getElementById('openAiConfig');    
    removeApiKeyButton.addEventListener('click', function() {
        window.location.href = 'openai_config.html';
    });
}

async function ttsService(apiKey, voiceName) {
    const ttsInputSaveButton = document.getElementById('ttsInputSaveButton');
    const ttsInput = document.getElementById('ttsInput');
    const ttsInputStatusMessage = document.getElementById('ttsInputStatusMessage');

    ttsInputSaveButton.addEventListener('click', async function() {
        const ttsText = ttsInput.value;
        if (!ttsText.length) {
            ttsInputStatusMessage.textContent = 'No input detected.';
            return;
        }

        chrome.runtime.sendMessage({ action: 'babel_tts_save_text_input', value: ttsText }, (response) => {
            console.log('Response from service worker:', response.status);
        });

        await setToLocalStorage("babel_tts_plain_text", ttsText, ttsInputStatusMessage);
        await sendRequestToOpenai(ttsText, apiKey, voiceName);
    });
}

async function sendRequestToOpenai(text, apiKey, voiceName) {
    try {
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
            throw new Error(`Invalid Response. Response: ${response} Status Ok: ${response.ok}`);
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

async function waitForDom() {
    document.addEventListener('DOMContentLoaded', async function() {
        resultApiKey = await getFromLocalStorage('babel_tts_openai_apikey');
        console.log(resultApiKey)
        if (!resultApiKey) {
            console.log("changing href " + resultApiKey)
            window.location.href = 'set_api_key.html';
        }
        ttsInputStatusMessage.textContent = `${resultApiKey} tts_home.html`;

        resultVoice = await getFromLocalStorage('babel_tts_openai_voice_name');
        if (!resultVoice) {
            await setToLocalStorage("babel_tts_openai_voice_name", 'onyx');
            resultVoice = 'onyx';
        }
        rerouteToSettings()
        ttsService(resultApiKey, resultVoice)
    });
}

waitForDom()
