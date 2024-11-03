/*
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
*/

function createDynamicFilename(text) {
  let stringified_text = text;
  if (!(typeof text === 'string')) {
    stringified_text = String(stringified_text);
  }

  let textLen = stringified_text.length;
  if (textLen < 5) {
    stringified_text = 'output.mp3'
    return stringified_text;
  }

  stringified_text = stringified_text.replace(/\s+/g , '_');
  let modified_text = '';
  for (let i = 0; i < textLen; i++) {
    const char = stringified_text[i];
    const testC = /^[a-zA-Z]$/.test(char);
    const testN = /^[0-9]$/.test(char);
    const testU = /_/.test(char);

    if (testC || testN || testU) {
      modified_text += char;
    }

    if (i == 22) {
      return;
    }
  } 

  modified_text = modified_text.replace(/^_+|_+$/g, '');
  if (modified_text.length < 5) {
    modified_text = 'output.mp3'
  }

  modified_text += '.mp3'
  return modified_text;
}

function checkForChanges() {
  if (previousTtsInput == savedTtsInput) {
    return;
  }

  console.log('Value changed from', previousTtsInput, 'to', savedTtsInput);
  console.log(createDynamicFilename(savedTtsInput))
  previousTtsInput = savedTtsInput;
}

let previousTtsInput = '';

let savedTtsInput = '';
let msgApiKey = '';
let msgVoiceName = '';

let generatedFile = null;

/* TODO: Reintegrate calling api
- Save the filename to a global variable here
- Somehow listen for change in startProcessingTts of find another way to do it
- If it changes, then all buttons on the extension should be blocked (change state), use a loading icon of sorts
- Asynchronously when name is being created (add async!), use fetch to make a post request, again, with parameters from input
- Change something on the frontend to signify that it finished processing
- 2 new buttons: save to .mp3 and listen in browser, user clicks one of their choice and it happens
- make it happen

    TODO 2: Check if other languages are available, if yes, add the whole logic of handling lang choice (-_-) zzz

    TODO 3: Add some styles (-_-) zzzzzzzzzzzzzzz
*/
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!(request.action === 'babel_tts_save_text_input')){
    sendResponse({ status: 'wrong action' });
    return;
  }

  if (!request.value.msgTtsText || !request.value.msgApiKey || !request.value.msgVoiceName) {
    sendResponse({ status: `missing content in ${JSON.stringify(request)}` });
    return;
  }
  sendResponse({ status: 'success' });

  savedTtsInput = request.value.msgTtsText;
  msgApiKey = request.value.msgApiKey;
  msgVoiceName = request.value.msgVoiceName;

  // sendRequestToOpenai(savedTtsInput, msgApiKey, msgVoiceName);
});


const interval = 5000;
setInterval(checkForChanges, interval);