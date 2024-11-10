
function addListenerForProcessUsIn(saveButton = null, playButton = null, generateButton = null, cogButton = null, loadingMsg = null) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (!(request.action === 'babel_tts_start_generating_file')){
            return;
        }
      
        if (request.value == "no") {
            document.getElementById(loadingMsg).textContent = "";

            document.getElementById(saveButton).disabled = false;
            document.getElementById(saveButton).style.visibility = 'hidden';
    
            document.getElementById(playButton).disabled = false;
            document.getElementById(playButton).style.visibility = 'hidden';
    
            document.getElementById(generateButton).disabled = false;
    
            document.getElementById(cogButton).disabled = false;     
            return;
        }

        if (request.value == "processing") {
            document.getElementById(loadingMsg).textContent = "Processing in Progress.";
    
            document.getElementById(saveButton).disabled = true;
            document.getElementById(saveButton).style.visibility = 'visible';
    
            document.getElementById(playButton).disabled = true;
            document.getElementById(playButton).style.visibility = 'visible';

            document.getElementById(generateButton).disabled = true;
    
            document.getElementById(cogButton).disabled = true;      
            return;
        }

        document.getElementById(loadingMsg).textContent = "";

        document.getElementById(saveButton).disabled = false;
        document.getElementById(saveButton).style.visibility = 'visible';

        document.getElementById(playButton).disabled = false;
        document.getElementById(playButton).style.visibility = 'visible';

        document.getElementById(generateButton).disabled = false;

        document.getElementById(cogButton).disabled = false;    
      });
}

async function saveResultsToMp3(blob, ttsFilename) {
    const saveFileHandle = await window.showSaveFilePicker({
      suggestedName: ttsFilename,
        types: [{
          description: "Audio Files",
          accept: { "audio/mpeg": [".mp3"] }
        }]
    })
    const writableStream = await saveFileHandle.createWritable();
    
    if (!blob) {
        chrome.runtime.sendMessage({ action: 'babel_tts_start_generating_file', value: "no" });
        return;
    }

    await writableStream.write( blob );
    await writableStream.close();
    chrome.runtime.sendMessage({ action: 'babel_tts_start_generating_file', value: "yes" });
  }