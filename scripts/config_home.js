
async function start() {
    setWallpaperFromChromeLocalStorage();
    
    addListenerReroute("returnHome", "home.html");
    addListenerReroute("configOpenAi", "config_openai.html");
    addListenerReroute("configAppearance", "config_appearance.html");
}

start()
