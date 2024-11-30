import StorageVar from "./storage.js";

function showTab(tab) {
  for(const section of document.querySelectorAll("body > section")) {
    if(section.id === tab) section.style.display = "block";
    else section.style.display = "none";
  }
}

showTab("mainSection");

function registerNavButton(selector, tab) {
  document.querySelector(selector)
          .addEventListener("click", () => showTab(tab));
}

registerNavButton("#btnHome", "mainSection");
registerNavButton("#btnConfig", "configSection");
registerNavButton("#btnAppearance", "configApperanceSection");
registerNavButton("#btnOpenAI", "configOpenAISection");

document.querySelector("#mainForm")
        .addEventListener("submit", ev => {
          console.log(ev.currentTarget.elements.text.value);
        });

const wallpaper = new StorageVar("wallpaper", "none");
const openAIVoice = new StorageVar("openai_apikey");
const openAIModel = new StorageVar("openai_model");
const openAIAPIKey = new StorageVar("openai_voice_name");

wallpaper.addEventListener("change", ({ value }) => {
  document.documentElement.style.setProperty('--dynamic-background-image', value === "none" ? "none" : `url(${value})`);
});

function registerConfigInput(selector, storageVar) {
  storageVar.initPromise()
            .then(() => {
              const input = document.querySelector(selector);
              
              input.value = storageVar.get() || "";
              input.addEventListener("change", ev => storageVar.set(ev.currentTarget.value));
              storageVar.addEventListener("change", ev => input.value = ev.value || "");
            })
            .catch(console.error)
}

registerConfigInput("#inputOpenAIVoice", openAIVoice);
registerConfigInput("#inputOpenAIModel", openAIModel);
registerConfigInput("#inputOpenAIAPIKey", openAIAPIKey);

async function loadWallpapers() {
  const wallpaperInput = document.querySelector("#inputWallpaper");
  const root = await chrome.runtime.getPackageDirectoryEntry();
  const wallpaperDir = await new Promise((res, rej) => root.getDirectory("images/themes", {}, res, rej));
  const files = await new Promise((res, rej) => wallpaperDir.createReader().readEntries(res, rej));
  files.sort((a, b) => a.name.localeCompare(b.name));
  
  for(const file of files) {
    wallpaperInput.add(new Option(file.name, file.fullPath.slice(6)), wallpaperInput.options.length - 1);
  }
  
  await wallpaper.initPromise();
  if(!wallpaper.present && files.length > 0) wallpaper.setDefault(wallpaperInput.options.item(0).value);
  
  registerConfigInput("#inputWallpaper", wallpaper);
}
loadWallpapers().catch(console.error);


