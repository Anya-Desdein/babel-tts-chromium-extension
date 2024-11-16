function playerToggle(elementName, blobExists) {
    const element = document.getElementById(elementName);
    if (!blobExists) {
        element.dataset.disabled = "true";
        return;        
    }
        
    element.dataset.disabled = "false";
}

function updateAudioSource(audio, playerName) {
    const player = document.getElementById(playerName);
    console.log("Type of player: ", player);
    
    const source = player.querySelector("source");

    const audioUrl = URL.createObjectURL(audio);
    source.src = audioUrl;
    player.load();

    // Optionally, start playing immediately
    // audioPlayer.play();
}

function askForBlobToObjectUrl(playerName) {
    chrome.runtime.sendMessage({ action: 'babel_tts_request_file_tts_openai', value: "request"}, (response) => {
        const receivedData = response.blob;

        // Due to serialization of sendMessage responses, blob has to be converted to array and then reverted
        const blob = revertResponseToBlob(receivedData);
        console.log("Blob:", blob);

        updateAudioSource(blob, playerName);
    });
}

function addListenerIsBlobAvailable() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (!(request.action == 'babel_tts_change_key_state_tts_openai')){
        return;
        }
    
        if (!allowedProcessingStates.includes(request.value)) {
        return;
        }
    
        if (request.value == "processing") {
        processingState = "processing1";
        sendResponse({response: "ok"});
        return;
        }
    
        processingState = request.value;
        sendResponse({response: "ok"});
    });
}