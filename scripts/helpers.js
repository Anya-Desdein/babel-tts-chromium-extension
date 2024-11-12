function setWallpaperFromChromeLocalStorage() {
  const savedWallpaper = localStorage.getItem('babel_tts_wallpaper');
  if (savedWallpaper) {
      document.documentElement.style.setProperty('--dynamic-background-image', `url(${savedWallpaper})`);
  }
}

function addListenerReroute(elementName, pageHref) {
  const routeButton = document.getElementById(elementName);    
  routeButton.addEventListener('click', function() {
      window.location.href = pageHref;
  });
}

async function saveBlobToMp3(blob, ttsFilename) {
    const saveFileHandle = await window.showSaveFilePicker({
      suggestedName: ttsFilename,
        types: [{
          description: "Audio Files",
          accept: { "audio/mpeg": [".mp3"] }
        }]
    })
    const writableStream = await saveFileHandle.createWritable();

    await writableStream.write(blob);
    await writableStream.close();

    chrome.runtime.sendMessage({ action: 'babel_tts_start_generating_file_tts_openai', value: "yes" });
  }