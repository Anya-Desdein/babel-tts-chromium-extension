
async function start() {
    setWallpaperFromChromeLocalStorage();
    
    addListenerReroute("returnHome", "home.html");
    addListenerReroute("configTtsOpenAi", "config_tts_openai.html");
    addListenerReroute("configAppearance", "config_appearance.html");
}

start()
