
async function waitForDom() {
    document.addEventListener('DOMContentLoaded', async function() {
        createRouterListener("returnHome", "home.html");
        createRouterListener("configOpenAi", "config_openai.html");
        createRouterListener("configAppearance", "config_appearance.html");

    });
}

waitForDom()
