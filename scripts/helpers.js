function createRouterListener(elementId, pageHref) {
  const routeButton = document.getElementById(elementId);    
  routeButton.addEventListener('click', function() {
      window.location.href = pageHref;
  });
}

function changeStateText(state, elementName) {
  if (state == "no") {
    document.getElementById(elementName).textContent = "";   
    return;
  }

  if (state == "processing") {
    document.getElementById(elementName).textContent = "Processing in Progress.";   
    return;
  }

  if (state == "noApiKey") {
    document.getElementById(elementName).textContent = "No OpenAi Api Key, please add it before generating";
    return;
  }

  document.getElementById(elementName).textContent = "";
}

function changeStateHiddenButton(state, elementName) {
  if (state == "no") {
    document.getElementById(elementName).disabled = false;
    document.getElementById(elementName).style.visibility = 'hidden'; 
    return;
  }

  if (state == "processing" || state == "noApiKey") {
    document.getElementById(elementName).disabled = true;
    document.getElementById(elementName).style.visibility = 'visible';     
    return;
  }

  document.getElementById(elementName).disabled = false;
  document.getElementById(elementName).style.visibility = 'visible';  
}

function changeStateButton(state, elementName) {
  if (state == "no") {
    document.getElementById(elementName).disabled = false;
    return;
  }

  if (state == "processing" || state == "noApiKey") {
    document.getElementById(elementName).disabled = true;    
    return;
  }

  document.getElementById(elementName).disabled = false;
}

function addListenerStateChangeFromBackground(saveButton = null, playButton = null, generateButton = null, loadingMsg = null) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (!(request.action === 'babel_tts_start_generating_file')){
            return;
        }

        changeStateText(state, loadingMsg);

        changeStateButton(state, generateButton);
      
        changeStateHiddenButton(state, saveButton);
        changeStateHiddenButton(state, playButton);
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

  function setWallpaperFromChromeLocalStorage() {
    const savedWallpaper = localStorage.getItem('babel_tts_wallpaper');
    if (savedWallpaper) {
        document.documentElement.style.setProperty('--dynamic-background-image', `url(${savedWallpaper})`);
    }
  }