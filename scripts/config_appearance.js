function getImageURL(fileName) {
    return chrome.runtime.getURL(`themes/${fileName}`);
}

function isImage(fileName) {
    return /\.(jpg|jpeg|png|gif|svg)$/i.test(fileName);
}

async function createImageArray(themeList) {
    for (let i = 1; i <= 20; i++) {
        const imageName = "bg" + i + ".png";
        const imageUrl = getImageURL(imageName);
        try {
            const response = await fetch(imageUrl, { method: 'HEAD' });
            if (response.ok) {
                themeList.push(imageUrl);
            } else {
                break;
            }
        } catch (error) {
            break;
        }
    }
}

function addElementsToSelect(elementArray, selectName) {
    const select = document.getElementById(selectName);
    for (let i = 1; i <= elementArray.length; i++) {
        const wallpaperName = elementArray[i-1].split('/').pop();
        const newElement = new Option(wallpaperName, wallpaperName);
        select.add(newElement);
    }
    const newElement = new Option("No Image", "no-image");
    select.add(newElement);
}

function addListenerForThemeChange(themeList) {
    const pickWallpaperSaveButton = document.getElementById("pickWallpaperSaveButton");

    pickWallpaperSaveButton.addEventListener('click', function() {
        const wallpaperName = document.getElementById('pickWallpaper').value;
        if (wallpaperName == "no-image") {
            localStorage.setItem('babel_tts_wallpaper', " ");
            document.documentElement.style.setProperty('--dynamic-background-image', `url(${" "})`);
            return;
        }

        const pickedWallpaper = themeList.find(url => url.endsWith(wallpaperName));
        localStorage.setItem('babel_tts_wallpaper', pickedWallpaper);
        document.documentElement.style.setProperty('--dynamic-background-image', `url(${pickedWallpaper})`);
    });
}

async function waitForDom() {
    setWallpaperFromChromeLocalStorage();

    themeList = [];
    document.addEventListener('DOMContentLoaded', async function() {
        createRouterListener("returnHome", "home.html");
        createRouterListener("configHome", "config_home.html");

        await createImageArray(themeList);
        addElementsToSelect(themeList, "pickWallpaper");
        addListenerForThemeChange(themeList);
    });
}

waitForDom();
