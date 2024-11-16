function revertResponseToBlob(dataArray, mimeType = 'audio/mpeg') {
  const revUint8Array = new Uint8Array(dataArray);
  const blob = new Blob([revUint8Array], {type: mimeType});
  return blob;
}

async function saveBlobToMp3(blob, ttsFilename) {
    const saveFileHandle = await window.showSaveFilePicker({
      suggestedName: ttsFilename,
        types: [{
          description: "Audio Files",
          accept: { "audio/mpeg": [".mp3"] }
        }]
    })
    const writableStream = await saveFileHandle.createWritable();

    await writableStream.write(blob);
    await writableStream.close();
  }