
export class StorageChangeEvent extends Event {
  constructor(value) {
    super("change");
    this.value = value;
  }
}

export class StorageInitEvent extends Event {
  constructor() {
    super("init");
  }
}

export default class StorageVar extends EventTarget {
  constructor(key, defaultValue = null) {
    super();
    
    this.key = key;
    this.value = defaultValue;
    this.defaultValue = defaultValue;
    this.initialized = false;
    this.present = false;
    
    this.init().catch(console.error)
  }
  
  async init() {
    const { [this.key]: value } = await chrome.storage.local.get(this.key);
    
    this.initialized = true;
    
    if(value !== undefined) {
      this.value = value;
      this.present = true;
      this.dispatchEvent(new StorageChangeEvent(value));
      this.dispatchEvent(new StorageInitEvent());
    } else {
      this.present = false;
      this.dispatchEvent(new StorageInitEvent());
    }
  }
  
  async initPromise() {
    if(!this.initialized) await new Promise(res => this.addEventListener("init", res, { once: true }));
  }
  
  get() {
    return this.value;
  }
  
  set(value) {
    this.value = value;
    this.present = true;
    this.dispatchEvent(new StorageChangeEvent(this.value));
    chrome.storage.local.set({ [this.key]: value }).catch(console.error);
  }
  
  setDefault(defaultValue) {
    this.defaultValue = defaultValue;
    
    if(!this.present) {
      this.value = this.defaultValue;
      this.dispatchEvent(new StorageChangeEvent(this.value));
    }
  }
  
  clear() {
    this.value = this.defaultValue;
    this.present = false;
    this.dispatchEvent(new StorageChangeEvent(this.value));
    chrome.storage.local.remove(this.key, value);
  }
}
