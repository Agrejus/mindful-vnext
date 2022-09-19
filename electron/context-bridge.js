const { ipcMain } = require("electron");

window.NodePouchDB = require("pouchdb");
window.NodePouchDB.plugin(require("pouchdb-find"));

const register = () => {
    window.api = {
        send: (channel, ...data) => {

           
        },
        listen: (channel, func) => {

          
        },
        listenOnce: (channel, func) => {

        
        },
        removeListener: (channel, func) => {

         
        },
        db: () => {
            return new NodePouchDB('mindful-db-1')
        }
    };
}

const recieveFromClient = (channel, listener) => {
    ipcMain.on(channel, listener)
}

module.exports = { register, recieveFromClient }