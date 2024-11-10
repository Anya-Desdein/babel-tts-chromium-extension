async function sendRequestToOpenai(text, apiKey, voiceName) {
  try {
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
        processingState = "no";
        throw new Error(`Invalid Response. Response: ${response} Status Ok: ${response.ok}`);
      }else {
        generatedFileBlob = await response.blob();
        convertedData = await convertMp3BlobToJson(generatedFileBlob);

        console.log("Blob size: ", generatedFileBlob.size);
        console.log("Blob type: ", generatedFileBlob.type);
        processingState = 'yes';
      }
  } catch (error) {
      processingState = "no";
      console.error("Error generating TTS:", error);
      document.getElementById("ttsInputStatusMessage").textContent = `Failed to generate. Error: ${error}`;
  }
}

function createDynamicFilename(text) {
  let stringified_text = text;
  if (!(typeof text === 'string')) {
    stringified_text = String(stringified_text);
  }

  let textLen = stringified_text.length;
  if (textLen < 5) {
    return 'output.mp3';
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
    return 'output.mp3';
  }

  modified_text += '.mp3'
  return modified_text;
};

function checkIfTtsProcessing() {
  if (processingState == "processing1") {
    processingState = "processing2";

    chrome.runtime.sendMessage({ action: 'babel_tts_start_generating_file', value: "processing" });
    console.log('Value changed from', previousTtsInput, 'to', savedTtsInput);
    ttsFilename = createDynamicFilename(savedTtsInput);

    previousTtsInput = savedTtsInput;
    sendRequestToOpenai(savedTtsInput, msgApiKey, msgVoiceName);
    return;
  }
  
  if (processingState == "yes") {
    chrome.runtime.sendMessage({ action: 'babel_tts_start_generating_file', value: "yes" });
    return;
  }

  if (processingState == "no") {
    chrome.runtime.sendMessage({ action: 'babel_tts_start_generating_file', value: "no" });
    return;
  }
}

async function convertMp3BlobToJson(blob) {
  const dataArrayBuffer = await blob.arrayBuffer();
  console.log(dataArrayBuffer);
  const dataUint8Array = new Uint8Array(dataArrayBuffer);
  console.log(dataUint8Array);
  const dataArray = Array.from(dataUint8Array);
  console.log(dataArray);

  return dataArray;
}

let previousTtsInput = '';
let savedTtsInput = '';
let msgApiKey = '';
let msgVoiceName = '';

let ttsFilename = '';
let generatedFileBlob = null;
let convertedData = null;
let processingState = 'no';

/* TODO: Fix listeners and messaging 
  - important! saving a file is broken, it allows you to save a file with a correct name, but no data present, investigate the root of the issue and solve it
  - uncaught promise error: could not stablish connection, receiving end does not exist in background.js if extension is not open, to my knowledge it does not affect the flow

    TODO 2: Check if other languages are available, if yes, add the whole logic of handling lang choice (-_-) zzz

    TODO 3: Add some styles (-_-) zzzzzzzzzzzzzzz
*/
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!(request.action === 'babel_tts_save_text_input')){
    return;
  }

  if (!request.value.msgTtsText || !request.value.msgApiKey || !request.value.msgVoiceName) {
    sendResponse({ status: `missing content in ${JSON.stringify(request)}` });
    return;
  }
  sendResponse({ status: 'success' });

  processingState = "processing1";
  savedTtsInput = request.value.msgTtsText;
  msgApiKey = request.value.msgApiKey;
  msgVoiceName = request.value.msgVoiceName;
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!(request.action == 'babel_tts_download_mp3')){
    return;
  }

  if (!(request.value == "download")) {
    return;
  }

  console.log(convertedData);
  sendResponse({blob: convertedData, ttsFilename: ttsFilename });
});


const interval = 2000;
setInterval(checkIfTtsProcessing, interval);