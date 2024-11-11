
async function waitForDom() {
    document.addEventListener('DOMContentLoaded', async function() {
        createRouterListener("returnHome", "home.html");
        createRouterListener("configOpenAi", "config_openai.html");

    });
}

waitForDom()
