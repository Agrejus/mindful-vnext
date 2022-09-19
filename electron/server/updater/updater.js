const { autoUpdater } = require('electron-updater');
const { recieveFromClient } = require('../../context-bridge');

module.exports = (app, mainWindow) => {
    autoUpdater.logger = require('electron-log');
    autoUpdater.logger.transports.file.level = 'info';
    autoUpdater.autoDownload = false;

    // const sendToClient = (evt, data) => mainWindow.webContents.send(evt, data);
    
    // autoUpdater.on('download-progress', progressObj => sendToClient(ContextBridgeServerToClientEvents.AppUpdateProgress, progressObj));
    // autoUpdater.on('update-downloaded', (ev, info) => sendToClient(ContextBridgeServerToClientEvents.AppUpdateDownloaded, info));
    // autoUpdater.on('error', error => {

    //     if (process.env["ELECTRON_ENV"] !== "attached") {
    //         // avoid errors locally
    //         sendToClient(ContextBridgeServerToClientEvents.AppUpdateError, {
    //             prettyError: 'Update error',
    //             error,
    //         })
    //     }
    // });

    // recieveFromClient(ContextBridgeClientToServerEvents.AppUpdateCheckForUpdates, async () => {
    //     try {
    //         const { updateInfo } = await autoUpdater.checkForUpdates();
    //         const { version: latestVersion, releaseNotes } = updateInfo;
    //         const version = app.getVersion();

    //         return version !== latestVersion ? sendToClient(ContextBridgeServerToClientEvents.AppUpdateAvailable, {
    //             version: latestVersion,
    //             releaseNotes,
    //         }) : sendToClient(ContextBridgeServerToClientEvents.AppUpdateNotAvailable, { version });
    //     } catch (error) {

    //         if (process.env["ELECTRON_ENV"] !== "attached") {
    //             // avoid errors locally
    //             sendToClient(ContextBridgeServerToClientEvents.AppUpdateError, {
    //                 prettyError: 'Check For Updates Failed',
    //                 error,
    //             });
    //         }
    //     }
    // });

    // recieveFromClient(ContextBridgeClientToServerEvents.AppUpdateApplyUpdate, async () => {
    //     try {
    //         if (mainWindow) {
    //             app.quitting = true;
    //             mainWindow.close();
    //         }

    //         await autoUpdater.quitAndInstall(false, true);
    //     } catch (error) {
    //         sendToClient(ContextBridgeServerToClientEvents.AppUpdateError, {
    //             prettyError: 'Apply Update Failed',
    //             error,
    //         });
    //     }
    // });

    // recieveFromClient(ContextBridgeClientToServerEvents.AppUpdateDownloadUpdate, async () => {
    //     try {
    //         await autoUpdater.downloadUpdate();
    //     } catch (error) {
    //         sendToClient(ContextBridgeServerToClientEvents.AppUpdateError, {
    //             prettyError: 'Download Update Failed',
    //             error,
    //         });
    //     }
    // });

    return {
        //openUpdates: () => sendToClient(ContextBridgeServerToClientEvents.AppUpdateOpenUpdates),
    };
};
