chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "triggerOffscreen") {
    console.log("Offscreen task received:" + "dupa");
  }
});
