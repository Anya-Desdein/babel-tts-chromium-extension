async function getFromLocalStorage(value) {
    let result = await chrome.storage.local.get(value);
    result = result[value];
    if (!result) {
        return null;
    } else {
        if (!(typeof result === 'string')){
            result = JSON.stringify(result);
        }
        return result;
    }
}

async function setToLocalStorage(key, value, errTarget=null) {
    await chrome.storage.local.set({ [key]: value });
    result = await getFromLocalStorage(key);
    if (!result) {
        if (errTarget) {
            errTarget.textContent = "Something went wrong. Key not in local storage.";
            return key;
        }
    } else {
        if (errTarget) {
            errTarget.textContent = `Value ${result} saved under key ${key}`;
            return null;
        }
    }
}

async function removeFromLocalStorage(key, errTarget=null) {
    console.log(typeof key, key);
    await chrome.storage.local.remove(key);
    result = await getFromLocalStorage(key);
    if (!result) {
        if (errTarget) {
            errTarget.textContent = "Key removed from local storage.";
            return null;
        }
    }
    if (errTarget) {
        errTarget.textContent = `Something went wrong. Value ${result} still exists under key ${key}`;
        return key;
    }
}
