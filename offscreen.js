const audioElement = document.getElementById("audioElement");

chrome.runtime.onMessage.addListener((message) => {
  if (message.command === "controlAudio") {
    if (message.isPlaying) {
      audioElement.play();
    } else {
      audioElement.pause();
      audioElement.currentTime = 0; // Reset playback position
    }
  }
});
