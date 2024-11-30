import * as blobShared from '../shared/blob_shared.js';

// 3 generations are stored max at once.
// If all slots are already taken, the one replaced will be the one that isn't being played, one with the lowest number (oldest).
// Else, the one used will be the one with the lowest number.
const firstMp3BlobElement = new blobShared.Mp3BlobElement();
const secondMp3BlobElement = new blobShared.Mp3BlobElement();
const thirdtMp3BlobElement = new blobShared.Mp3BlobElement();
const mp3BlobElementList = [firstMp3BlobElement, secondMp3BlobElement, thirdtMp3BlobElement];
