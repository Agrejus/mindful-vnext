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
exports.edit = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const edit = () => {
    const sourceFilePath = path.resolve(__dirname, '../android/variables.gradle');
    const buffer = fs.readFileSync(sourceFilePath);
    const data = buffer.toString();
    const result = data.replace("compileSdkVersion = 29", "compileSdkVersion = 30").replace("targetSdkVersion = 29", "targetSdkVersion = 30");
    console.log(result);
    fs.writeFileSync(sourceFilePath, result);
};
exports.edit = edit;
(0, exports.edit)();
//# sourceMappingURL=edit-android-sdk.js.map