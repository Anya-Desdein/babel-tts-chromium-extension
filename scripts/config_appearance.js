
async function waitForDom() {
    document.addEventListener('DOMContentLoaded', async function() {
        createRouterListener("returnHome", "home.html");
        createRouterListener("configHome", "config_home.html");
    });
}

waitForDom()
