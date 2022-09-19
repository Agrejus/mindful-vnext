const {
    app,
    BrowserWindow,
    Menu,
    globalShortcut,
    protocol,
} = require("electron");

require("@electron/remote/main").initialize();
const path = require("path");
const open = require("open");

const fs = require("fs");

const { generateUpdateYml } = require("./utils");
const log = require("electron-log");
const debounce = require("debounce");

global.__basedir = path.resolve(__dirname);

let mainWindow = null;

const hasLock = app.requestSingleInstanceLock();

if (!hasLock) {
    app.quit();
}

const showMainWindow = () => {
    if (mainWindow) {
        mainWindow.show();
        mainWindow.restore();
        mainWindow.focus();
    }
};

app.on("second-instance", () => showMainWindow());

app.on("render-process-gone", (_event, _webContents, details) => {
    const event = "render-process-gone";

    log.error(`${event} Details `, details);

    const crashReasons = ["crashed", "oom"];

    if (crashReasons.includes(details?.reason)) {
        log.info("Restarting Render Process");

        app.relaunch();
        app.quit();
    }
});

const appUrl = `file://${__dirname}/app/index.html`;

const registerReloadCommand = () => globalShortcut.register("CommandOrControl+Shift+R", () =>
    mainWindow.reload()
);
const sendToClient = (evt, data) => mainWindow.webContents.send(evt, data);
const loadUrl = (url, shouldOpenDevTools) => {
    mainWindow.loadURL(url);

    if (shouldOpenDevTools === true) {
        mainWindow.webContents.toggleDevTools();
    }
};
const configureRefreshWatcher = () => {
    const debounceReload = debounce(() => {
        console.log("reloading main window");
        mainWindow.reload();
    }, 250);

    const watchPath = path.join(__dirname, "app");
    fs.watch(watchPath, (e) => {
        if (e === "change") {
            debounceReload();
        }
    });
};

let shouldOpenDevTools = false;

async function createWindow() {


    mainWindow = new BrowserWindow({
        height: 920,
        width: 1600,
        webPreferences: {
            enableRemoteModule: true,
            nodeIntegration: false,
            preload: path.join(__dirname, "preload.js"),
            nativeWindowOpen: true,
            contextIsolation: false,
            webSecurity: false,
        },
    });

    require("@electron/remote/main").enable(mainWindow.webContents);

    globalShortcut.register("CommandOrControl+K", () =>
        mainWindow.openDevTools()
    );

    if (process.env["ELECTRON_ENV"] === "serve") {
        appUrl = `http://localhost:3000`;
        shouldOpenDevTools = true;

        registerReloadCommand();
    } else if (process.env["ELECTRON_ENV"] === "native") {
        // generate update yml
        generateUpdateYml();
        shouldOpenDevTools = true;
        registerReloadCommand();
        configureRefreshWatcher();
    }

    loadUrl(appUrl, shouldOpenDevTools);

    mainWindow.webContents.on("dom-ready", () => showMainWindow());

    mainWindow.webContents.on("new-window", (event, url) => {
        event.preventDefault();
        open(url);
    });

    mainWindow.on("close", (event) => {
        if (app.quitting) {
            mainWindow = null;
        } 
    });
}

app.whenReady().then(() => {
    createWindow();
});

app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (mainWindow == null) {
        createWindow();
    } else {
        showMainWindow();
    }
});

app.on("before-quit", () => (app.quitting = true));