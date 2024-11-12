
async function waitForDom() {
    document.addEventListener('DOMContentLoaded', async function() {
        setWallpaperFromChromeLocalStorage();

        addListenerReroute("returnHome", "home.html");
        addListenerReroute("configOpenAi", "config_openai.html");
        addListenerReroute("configAppearance", "config_appearance.html");
    });
}

waitForDom()
