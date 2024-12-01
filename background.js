let isPlaying = false;

// Ensure the offscreen document exists
async function ensureOffscreenDocument() {
  const offscreenExists = await chrome.offscreen.hasDocument();
  if (!offscreenExists) {
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["AUDIO_PLAYBACK"],
      justification: "Audio playback control from background"
    });
  }
}

// Handle commands from popup
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.command === "togglePlayPause") {
    await ensureOffscreenDocument();
    isPlaying = !isPlaying;
    chrome.runtime.sendMessage({ command: "updateState", isPlaying });
    chrome.runtime.sendMessage({ command: "controlAudio", isPlaying });
  } else if (message.command === "stopAudio") {
    isPlaying = false;
    chrome.runtime.sendMessage({ command: "updateState", isPlaying });
    chrome.runtime.sendMessage({ command: "controlAudio", isPlaying });
  }
});
