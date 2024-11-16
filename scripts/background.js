class Mp3BlobElement {
  constructor(serializedBlob = '', isUsed = false, name = '', number = 0) {
    this.serializedBlob = serializedBlob;
    this.isUsed = isUsed; 
    this.name = name; 
    this.number = number;
  }

  async setSerializedBlob(blob) {
    if (!blob) {
      return;
    }

    const dataArrayBuffer = await blob.arrayBuffer();
    const dataUint8Array = new Uint8Array(dataArrayBuffer);
    const dataArray = Array.from(dataUint8Array);

    this.serializedBlob = dataArray;
  } 
  copyFrom(other) {
    if (!(other instanceof Mp3BlobElement)) {
      return;
    }

    this.serializedBlob = other.serializedBlob;
    this.isUsed = other.isUsed;
    this.name = other.name;
    this.number = other.number;
  }
  setUsage(isCurrentlyUsed) {
    if (!isCurrentlyUsed) {
      return;
    }

    this.isUsed = isCurrentlyUsed;
  } 
  setName(name) {
    if (!name) {
      return;
    }

    this.name = name;
  } 
  setNumber(number) {
    if (!number) {
      return;
    }

    if (number > 3 || number < 0) {
      return;
    }

    this.number = number;
  }
}

// 3 generations are stored max at once. 
// If all slots are already taken, the one replaced will be the one that isn't being played, one with the lowest number (oldest). 
// If none slots are already taken, the one used will be the one with the lowest number. 
const firstMp3BlobElement = new Mp3BlobElement();
const secondMp3BlobElement = new Mp3BlobElement();
const thirdtMp3BlobElement = new Mp3BlobElement();
const mp3BlobElementList = [firstMp3BlobElement, secondMp3BlobElement, thirdtMp3BlobElement];

async function replaceMp3BlobElement(blob) {     
  const newMp3BlobElement = new Mp3BlobElement();
  // Due to serialization of sendMessage responses, blob has to be converted to array and then reverted
  newMp3BlobElement.setSerializedBlob(blob);

  const elementNumber = findSlotForNewMp3BlobElement(mp3BlobElementList, newMp3BlobElement);
  if (!elementNumber) {
    return;
  }

  sendMessageNewMp3BlobElementAvailable(state="newFileAvailable", newMp3BlobElement);
}

function findSlotForNewMp3BlobElement(mp3BlobElementList, newMp3BlobElement) {
  const len = mp3BlobElementList.length;
  for (let i = 0; i < len; i++) {
    if (!mp3BlobElementList[i].serializedBlob) {
      mp3BlobElementList[i].copyFrom(newMp3BlobElement);
      mp3BlobElementList[i].setName(ttsFilename);
      mp3BlobElementList[i].setNumber(i);
      return i;
    }
  }

  for (let i = 0; i < len; i++) {
    if (!mp3BlobElementList[i].isUsed) {
      mp3BlobElementList[i].copyFrom(newMp3BlobElement);
      mp3BlobElementList[i].setName(ttsFilename);
      mp3BlobElementList[i].setNumber(i);
      return i;
    }
  }
}

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

async function analyzeTtsResponseOpenAi(text, apiKey, voiceName, modelName="tts-1") {
  /*
  console.log("text: ", text);
  console.log("apiKey: ", apiKey);
  console.log("voiceName: ", voiceName); 
  */
    try {
      const response = await sendTtsReqOpenAi(text, apiKey, voiceName, modelName);
    if (!response.ok) {
      processingState = "noApiKey";
      throw new Error(`Invalid Response. Response: ${response} Status Ok: ${response.ok}`);
    } else {
      await replaceMp3BlobElement(await response.blob());
       processingState = 'yes';
    }
  } catch (error) {
      processingState = "no";
      console.error("Error generating TTS:", error);
  }
}

function sendMessageNewMp3BlobElementAvailable(stateReq, mp3BlobElementToSend) {
  response = {
    state: stateReq,
    serializedBlob: mp3BlobElementToSend.serializedBlob, 
    isUsed: mp3BlobElementToSend.isUsed, 
    name: mp3BlobElementToSend.name, 
    number: mp3BlobElementToSend.number
  }
  chrome.runtime.sendMessage({ action: 'babel_tts_change_key_state_tts_openai', value: response});
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

/*
function checkIfTtsProcessing() {
  if (processingState == "noApiKey" || processingState == "no" || processingState == "yes") {
    chrome.runtime.sendMessage({ action: 'babel_tts_start_generating_file_tts_openai', value: processingState });
    return;
  }

  if (processingState == "processing1") {
    processingState = "processing2";

    chrome.runtime.sendMessage({ action: 'babel_tts_start_generating_file_tts_openai', value: "processing" });

    if (previousTtsInput == currentTtsInput) {
      processingState = 'yes';
      return;
    }

    ttsFilename = createDynamicFilename(currentTtsInput);

    previousTtsInput = currentTtsInput;
    analyzeTtsResponseOpenAi(currentTtsInput, msgApiKey, msgVoiceName);
    return;
  }
}
*/

let previousTtsInput = '';
let currentTtsInput = '';

let msgApiKey = '';
let msgVoiceName = '';

let ttsFilename = '';
let generatedFileBlob = null;
let convertedData = null;
let processingState = 'no';

// const allowedProcessingStates = ['processing1', 'processing2', 'yes', 'no', 'noApiKey'];

/*  TODO 1: Add icons, fonts, animations on save
    TODO 2: Integrate with google cloud for text-to-text translation
*/

/* 
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
  currentTtsInput = request.value.msgTtsText;
  msgApiKey = request.value.msgApiKey;
  msgVoiceName = request.value.msgVoiceName;
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!(request.action == 'babel_tts_request_file_tts_openai') || !(request.value == "request")){
    return;
  }

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

  if (request.value == "processing") {
    processingState = "processing1";
    sendResponse({response: "ok"});
    return;
  }

  processingState = request.value;
  sendResponse({response: "ok"});
});
*/


async function initOffscreenDocument() {
  const hasOffscreen = await chrome.offscreen.hasDocument();
  if (hasOffscreen) {
    console.log("Offscreen document already exists.");
    return;
  }
  
  await chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: ["AUDIO_PLAYBACK"],
    justification: "Required for audio processing."
  });
  console.log("Offscreen document created."); 
}

const interval = 2000;
setInterval(checkIfTtsProcessing, interval);

chrome.runtime.onInstalled.addListener(() => {
  initOffscreenDocument();
});