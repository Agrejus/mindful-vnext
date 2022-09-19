"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.set = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const set = () => {
    const sourceFilePath = path.resolve(__dirname, "../package.json");
    const data = fs.readFileSync(sourceFilePath);
    const jsonRaw = data.toString();
    const json = JSON.parse(jsonRaw);

    const preSplit = json.version.replace('-rc', '')
    const versionSplit = preSplit.split('.');
    const appVersion = json.version;
    const majorVersion = versionSplit[0];
    const minorVersion = versionSplit[1];
    const patchVersion = versionSplit[2];
    const candidateVersion = versionSplit[3];
    const versionCode = ((+majorVersion * 1000) + (+minorVersion * 100) + (+patchVersion * 10) + 10000).toString();
    console.log(`##vso[task.setvariable variable=agentOS;isOutput=true]${process.env.AGENT_OS}`);
    console.log(`##vso[task.setvariable variable=appVersion;isOutput=true]${appVersion}`);
    console.log(`##vso[task.setvariable variable=majorVersion;isOutput=true]${majorVersion}`);
    console.log(`##vso[task.setvariable variable=minorVersion;isOutput=true]${minorVersion}`);
    console.log(`##vso[task.setvariable variable=patchVersion;isOutput=true]${patchVersion}`);
    console.log(`##vso[task.setvariable variable=candidateVersion;isOutput=true]${candidateVersion}`);
    console.log(`##vso[task.setvariable variable=versionCode;isOutput=true]${versionCode}`);
};
exports.set = set;
(0, exports.set)();
//# sourceMappingURL=set-static-variables.js.map