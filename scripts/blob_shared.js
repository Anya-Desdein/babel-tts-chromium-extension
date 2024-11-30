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

async function replaceMp3BlobElement(serializedBlob) {     
  const newMp3BlobElement = new Mp3BlobElement();
  newMp3BlobElement.serializedBlob = serializedBlob;

  const elementNumber = findSlotForNewMp3BlobElement(mp3BlobElementList, newMp3BlobElement);
  if (!elementNumber) {
    return;
  }

  return true;
}

async function replaceMp3BlobElementSerialize(blob) {     
  const newMp3BlobElement = new Mp3BlobElement();
  // Due to serialization of sendMessage responses, blob has to be converted to array and then reverted
  newMp3BlobElement.setSerializedBlob(blob);

  const elementNumber = findSlotForNewMp3BlobElement(mp3BlobElementList, newMp3BlobElement);
  if (!elementNumber) {
    return;
  }

  return elementNumber;
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

