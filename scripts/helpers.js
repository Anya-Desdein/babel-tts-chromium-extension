function setWallpaperFromChromeLocalStorage() {
  const savedWallpaper = localStorage.getItem('babel_tts_wallpaper');
  if (savedWallpaper) {
      document.documentElement.style.setProperty('--dynamic-background-image', `url(${savedWallpaper})`);
  }
}

function addListenerReroute(elementName, pageHref) {
  const routeButton = document.getElementById(elementName);    
  routeButton.addEventListener('click', function() {
      window.location.href = pageHref;
  });
}

function resizeTextArea(textArea) {
  textArea.style.height = 'auto';
  newHeight = textArea.scrollHeight + 3.5;
  textArea.style.height = newHeight + 'px';
}

function addListenerResizeTextArea(textAreaId) {
  const textArea = document.getElementById(textAreaId);

  textArea.addEventListener('input', function() {
    resizeTextArea(textArea);
  });
}

function generateUniqueId() {
  return `process-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}