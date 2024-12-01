document.getElementById("playPauseButton").addEventListener("click", () => {
    chrome.runtime.sendMessage({ command: "togglePlayPause" });
  });
  
  document.getElementById("stopButton").addEventListener("click", () => {
    chrome.runtime.sendMessage({ command: "stopAudio" });
  });
  