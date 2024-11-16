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

function addListenerResizeTextArea(textAreaId) {
  const textarea = document.getElementById(textAreaId);

  textarea.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = this.scrollHeight + 'px';
  });
}

function generateUniqueId() {
  return `process-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}