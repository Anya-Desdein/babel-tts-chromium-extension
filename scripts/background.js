import * as blobShared from './blob_shared.js';
import * as modifyChromeLocalVariables from './modify_chrome_local_variables.js';

// 3 generations are stored max at once. 
// If all slots are already taken, the one replaced will be the one that isn't being played, one with the lowest number (oldest). 
// Else, the one used will be the one with the lowest number. 
const firstMp3BlobElement = new blobShared.Mp3BlobElement();
const secondMp3BlobElement = new blobShared.Mp3BlobElement();
const thirdtMp3BlobElement = new blobShared.Mp3BlobElement();
const mp3BlobElementList = [firstMp3BlobElement, secondMp3BlobElement, thirdtMp3BlobElement];

// Another available model is tts-1-hd
async function sendTtsReqOpenAi(text, apiKey, voiceName="onyx" , modelName="tts-1") {
  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        model: modelName,
        voice: voiceName,
        input: text
    })
  })
  return response;
}

async function analyzeTtsResponseOpenAi(text, apiKey, voiceName="onyx", modelName="tts-1") {
    try {
      const response = await sendTtsReqOpenAi(text, apiKey, voiceName, modelName);
    if (!response.ok) {
      console.log(`Invalid Response. Response: ${response} Status Ok: ${response.ok}`);
      return "err";
    } else {
      const blobNumber = await blobShared.replaceMp3BlobElement(await response.blob());
      if (!blobNumber) {
        return "err";
      }
      sendMessageNewMp3BlobAvailable(state="newFileAvailable", mp3BlobElementList[blobNumber]);
      return "finishedProcessing";
    }
  } catch (error) {
      return "err";
  }
}

function sendMessageNewMp3BlobAvailable(stateReq, mp3BlobElementToSend) {
  response = {
    state: stateReq,
    serializedBlob: mp3BlobElementToSend.serializedBlob, 
    isUsed: mp3BlobElementToSend.isUsed, 
    name: mp3BlobElementToSend.name, 
    number: mp3BlobElementToSend.number
  }
  chrome.runtime.sendMessage({ action: 'babel_tts_new_mp3_blob_available', value: response});
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
}

function checkForProcessingRequest(fnProcessingState) {
  if (fnProcessingState == "requestProcessing") {
    fnProcessingState = "processingInProgress";
    chrome.runtime.sendMessage({ action: 'babel_tts_start_generating_file_tts_openai', value: fnProcessingState });
    return fnProcessingState;
  }

  chrome.runtime.sendMessage({ action: 'babel_tts_start_generating_file_tts_openai', value: fnProcessingState });
}

let processingState = 'noProcessing';
/*  TODO 1: Add icons, fonts, animations on save
    TODO 2: Integrate with google cloud for text-to-text translation
    TODO 3: Play in browser from offscreen
    TODO 4: Other play elements from offscreen
*/

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  processingState = "requestProcessing";
  if (!(request.action === 'babel_tts_save_text_input_tts_openai')){
    return;
  }

  if (!request.value.msgTtsText) {
    sendResponse({ status: `missing content in ${JSON.stringify(request)}` });
    return;
  }

  processingState = checkForProcessingRequest(processingState);
  if (processingState != "processingInProgress") {
    return;
  }

  if (processingState = "processingInProgress") {
    sendResponse({ status: 'success' });
    const currentTtsInput = request.value.msgTtsText;
    filename = createDynamicFilename(currentTtsInput);

    const apiKey = modifyChromeLocalVariables.getFromLocalStorage("babel_tts_openai_apikey");
    const voiceName = modifyChromeLocalVariables.getFromLocalStorage("babel_tts_openai_voice_name");
    const modelName = "tts-1";

    processingState = analyzeTtsResponseOpenAi(currentTtsInput, apiKey, voiceName, modelName);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!(request.action == 'babel_tts_request_file_tts_openai') || !(request.value == "request")){
    return;
  }

  // now has to return also requested el number

  if (!firstMp3BlobElement.serializedBlob) {
    return;
  }
  
  console.log(firstMp3BlobElement.serializedBlob);
  console.log(firstMp3BlobElement.name);

  sendResponse({blob: firstMp3BlobElement.serializedBlob, ttsFilename: firstMp3BlobElement.name });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!(request.action == 'babel_tts_change_key_state_tts_openai')){
    return;
  }

  if (!allowedProcessingStates.includes(request.value)) {
    return;
  }

  processingState = request.value;
  sendResponse({response: "ok"});
});

const interval = 1000;
setInterval(checkForProcessingRequest, interval);

async function initOffscreenDocument() {
  const hasOffscreen = await chrome.offscreen.hasDocument();
  if (hasOffscreen) {
    return;
  }
  
  await chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: ["AUDIO_PLAYBACK"],
    justification: "Required for audio processing."
  });
  console.log("New offscreen document created."); 
}

chrome.runtime.onInstalled.addListener(() => {
  initOffscreenDocument();
});