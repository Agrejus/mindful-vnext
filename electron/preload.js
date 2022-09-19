const { remote, app } = require("@electron/remote");
const path = require("path");
const userDataPath = (app || remote.app).getPath("userData");
const { register } = require("./context-bridge");
const { isFileLocked } = require("./utils");

window.NodePouchDB = require("pouchdb");
window.NodePouchDB.plugin(require("pouchdb-find"));

const dbFilePath = path.join(userDataPath, "mindful-v1");
const lockFilePath = path.join(dbFilePath, "LOCK");

window.dbPath = dbFilePath;

window.appVersion = (app || remote.app).getVersion();
window.mobileId = process.env.mobileid;

let events = {
  isDatabaseLocked: async () => {
    // only call once, do not let a user potentially spam this event
    const result = await isFileLocked(lockFilePath);
    // replace with noop
    events.isDatabaseLocked = () => Promise.resolve(false);
    return result;
  },
};

window.isDatabaseLocked = events.isDatabaseLocked;

register();
