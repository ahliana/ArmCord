import "./bridge.js";
import "./shelter.js";
import "./optimizer.js";
import {ipcRenderer} from "electron";
import fs from "fs";
import path from "path";
import {injectMobileStuff} from "./mobile.js";
import {injectTitlebar} from "./titlebar.mjs";
import {addStyle, addScript} from "../../common/dom.js";
import {sleep} from "../../common/sleep.js";
import type {ArmCordWindow} from "../../types/armcordWindow.d.js";

window.localStorage.setItem("hideNag", "true");
const disableShelter = ipcRenderer.sendSync("disableShelter");
if (ipcRenderer.sendSync("legacyCapturer")) {
    console.warn("Using legacy capturer module");
    await import("./capturer.js");
}

const version = ipcRenderer.sendSync("displayVersion") as string;
function updateLang(): void {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; locale=`);
    if (parts.length === 2) ipcRenderer.send("setLang", parts.pop()?.split(";").shift());
}

declare global {
    interface Window {
        armcord: ArmCordWindow;
    }
}

console.log(`ArmCord ${version}`);
ipcRenderer.on("themeLoader", (_event, message: string) => {
    addStyle(message);
});

if (ipcRenderer.sendSync("titlebar")) {
    injectTitlebar();
}
if (ipcRenderer.sendSync("mobileMode")) {
    injectMobileStuff();
}
await sleep(5000).then(() => {
    // dirty hack to make clicking notifications focus ArmCord
    addScript(`
        (() => {
        const originalSetter = Object.getOwnPropertyDescriptor(Notification.prototype, "onclick").set;
        Object.defineProperty(Notification.prototype, "onclick", {
            set(onClick) {
            originalSetter.call(this, function() {
                onClick.apply(this, arguments);
                armcord.window.show();
            })
            },
            configurable: true
        });
        })();
        `);
    if (ipcRenderer.sendSync("disableAutogain")) {
        addScript(fs.readFileSync(path.join(import.meta.dirname, "../", "/js/disableAutogain.js"), "utf8"));
    }
    const cssPath = path.join(import.meta.dirname, "../", "/css/discord.css");
    addStyle(fs.readFileSync(cssPath, "utf8"));
    updateLang();
});

// Settings info version injection
setInterval(() => {
    const host = document.querySelector('[class*="sidebar"] [class*="info"]');
    if (!host || host.querySelector("#ac-ver")) {
        return;
    }
    const el = host.firstElementChild!.cloneNode() as HTMLSpanElement;
    el.id = "ac-ver";
    el.textContent = `ArmCord Version: ${version}`;
    el.onclick = () => ipcRenderer.send("openSettingsWindow");
    host.append(el);
    if (disableShelter) {
        let advanced = document
            .querySelector('[class*="socialLinks"]')
            ?.parentElement?.querySelector(
                '[class*="header"] + [class*="item"] + [class*="item"] + [class*="item"] + [class*="item"] + [class*="item"] + [class*="item"] + [class*="item"] + [class*="item"] + [class*="item"]'
            );
        if (!advanced) return;
        if (advanced.nextSibling instanceof Element && advanced.nextSibling.className.includes("item")) {
            advanced = advanced.nextSibling;
        }
        const acSettings = advanced.cloneNode(true) as HTMLElement;
        const tManager = advanced.cloneNode(true) as HTMLElement;
        acSettings.textContent = "ArmCord Settings";
        acSettings.id = "acSettings";
        acSettings.onclick = () => ipcRenderer.send("openSettingsWindow");
        tManager.textContent = "Themes";
        tManager.id = "acThemes";
        tManager.onclick = () => ipcRenderer.send("openThemesWindow");
        advanced.insertAdjacentElement("afterend", acSettings);
        advanced.insertAdjacentElement("afterend", tManager);
    }
}, 1000);
