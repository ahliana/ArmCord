const customTitlebar = require('custom-electron-titlebar')
const electronLocalshortcut = require("electron-localshortcut");
const { remote } = require("electron");

window.addEventListener('DOMContentLoaded', () => {
  new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex("#202225"),
  });

/**
 * Utility function to add CSS in multiple passes.
 * @param {string} styleString
 */
 function addStyle(styleString) {
  const style = document.createElement('style');
  style.textContent = styleString;
  document.head.append(style);
}


const currentWindow = remote.getCurrentWindow();
electronLocalshortcut.register(currentWindow, "F5", () => {
  location.reload();
});
electronLocalshortcut.register(currentWindow, "F12", () => {
  currentWindow.webContents.openDevTools();
});
electronLocalshortcut.register(currentWindow, "F1", () => {
  require("shell").openExternal("https://support.discord.com/");
});
electronLocalshortcut.register(currentWindow, "F2", () => {
  window.location.href = "https://discord.com/invite/F25bc4RYDt";
});
require("./utils/capturer.js")
addStyle(`
@import url("https://kckarnige.github.io/femboi_owo/discord-font.css");
:root {
  --window-buttons: var(--header-secondary);
  --cord-color: var(--header-primary);
  --armcord-color: #7289da;
}
.base-3dtUhz, .sidebar-2K8pFh {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  overflow: hidden;
  border-top-left-radius: 8px;
}

div.menubar[role="menubar"] {
  width: 0px;
}

.window-title:after {
  content: "Cord";
  color: var(--cord-color) !important;
  font-weight: normal;
  font-size: 14px;
  font-family: Discordinated;
}

.window-title:before {
  content: "ARM";
  color: var(--armcord-color);
  font-weight: normal;
  font-size: 14px;
  font-family: Helvetica, sans-serif;
}

.window-title {
  font-size: 0px !important;
  margin-left: initial !important;
  transform: translate(10px, 2px) !important;
}

background: #202225 !important;
  background: var(--background-tertiary) !important;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
}
.titlebar .window-controls-container .window-icon {
  background: var(--window-buttons) !important;
}
`);
})

