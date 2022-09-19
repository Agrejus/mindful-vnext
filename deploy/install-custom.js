"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const logCloseMessage = (e) => {
    console.log(`Close: ${e}`);
};
const logDataMessage = (e) => {
    console.log(`$sdtout: ${e}`);
};
const logErrorMessage = (e) => {
    console.log(`Error: ${e}`);
};
const install = () => __awaiter(void 0, void 0, void 0, function* () {
    const typeArgument = process.argv.find(w => w.startsWith("--type"));
    if (!typeArgument) {
        throw new Error(`Missing --type argument from invocation`);
    }
    if (typeArgument.includes('=') === false) {
        throw new Error(`--type malformed, must be --type=<some value>`);
    }
    const packageKey = typeArgument.split('=')[1];
    const packageJson = yield Promise.resolve().then(() => require('../package.json'));
    const packages = packageJson[packageKey];
    if (!packages) {
        throw new Error(`Could not find dependency list for key.  KEY: ${packageKey}`);
    }
    const keyList = Object.keys(packages);
    if (keyList.length === 0) {
        throw new Error(`No packages to install for key.  KEY: ${packageKey}`);
    }
    const list = Object.keys(packages).map(w => `${w}@${packages[w]}`);
    const script = `npm install --no-package-lock --no-save --quiet ${list.join(" ")}`;
    const command = (0, child_process_1.exec)(script);
    command.stdout.on("data", e => logDataMessage(e));
    command.stderr.on("data", e => logErrorMessage(e));
    command.on("error", e => logErrorMessage(e.message));
    command.on("close", e => logCloseMessage(e));
});
install();
//# sourceMappingURL=install-custom.js.map