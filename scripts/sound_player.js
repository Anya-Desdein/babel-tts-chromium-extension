function playerToggle(elementName) {
    const element = document.getElementById(elementName);
    if (element.dataset.disabled == "false") {
        element.dataset.disabled = "true";
        return;
    }
    element.dataset.disabled = "false";
}

function updateAudioSource(audio, playerName) {
    const player = document.getElementById(playerName);
    console.log("Type of player: ", player );
    
    const source = player.querySelector("source");

    const audioUrl = URL.createObjectURL(audio);
    source.src = audioUrl;
    player.load();

    // Optionally, start playing immediately
    // audioPlayer.play();
}

function addListenerBlobToObjectUrl(playerName) {
    chrome.runtime.sendMessage({ action: 'babel_tts_request_file_tts_openai', value: "request"}, (response) => {
        const receivedData = response.blob;

        // Due to serialization of sendMessage responses, blob has to be converted to array and then reverted
        const blob = revertResponseToBlob(receivedData);
        console.log("Blob:", blob);

        updateAudioSource(blob, playerName);
    });
}