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
        processingState = "noApiKey";
        throw new Error(`Invalid Response. Response: ${response} Status Ok: ${response.ok}`);
      }else {
        generatedFileBlob = await response.blob();
        
        // Due to serialization of sendMessage responses, blob has to be converted to array and then reverted
        convertedData = await serializeMp3Blob(generatedFileBlob);

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
      break;
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
  if (processingState == "noApiKey" || processingState == "no" || processingState == "yes") {
    chrome.runtime.sendMessage({ action: 'babel_tts_start_generating_file_tts_openai', value: processingState });
    return;
  }

  if (processingState == "processing1") {
    processingState = "processing2";

    chrome.runtime.sendMessage({ action: 'babel_tts_start_generating_file_tts_openai', value: "processing" });

    if (previousTtsInput == savedTtsInput) {
      processingState = 'yes';
      return;
    }

    ttsFilename = createDynamicFilename(savedTtsInput);

    previousTtsInput = savedTtsInput;
    sendRequestToOpenai(savedTtsInput, msgApiKey, msgVoiceName);
    return;
  }
}

async function serializeMp3Blob(blob) {
  const dataArrayBuffer = await blob.arrayBuffer();
  const dataUint8Array = new Uint8Array(dataArrayBuffer);
  const dataArray = Array.from(dataUint8Array);
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

const allowedProcessingStates = ['processing1', 'processing2', 'yes', 'no', 'noApiKey'];

/*  TODO 1: Add icons, fonts, animations on save
    TODO 2: Integrate with google cloud for text-to-text translation
*/
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!(request.action === 'babel_tts_save_text_input_tts_openai')){
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
  if (!(request.action == 'babel_tts_download_file_tts_openai')){
    return;
  }

  if (!(request.value == "download")) {
    return;
  }
  
  sendResponse({blob: convertedData, ttsFilename: ttsFilename });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!(request.action == 'babel_tts_change_key_state_tts_openai')){
    return;
  }

  if (!allowedProcessingStates.includes(request.value)) {
    return;
  }

  if (request.value == "processing") {
    processingState = "processing1";
    sendResponse({response: "ok"});
    return;
  }

  processingState = request.value;
  sendResponse({response: "ok"});
});


const interval = 2000;
setInterval(checkIfTtsProcessing, interval);