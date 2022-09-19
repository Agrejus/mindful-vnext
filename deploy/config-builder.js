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
exports.build = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const build = () => __awaiter(void 0, void 0, void 0, function* () {
    // args
    // 1. source
    // 2. destination
    // look for any vars with prefix of CONFIG_BUILDER_
    const argKeys = process.argv.filter(w => w.startsWith("--"));
    const isDebugMode = argKeys.includes("--debug");
    const args = argKeys.reduce((a, v) => {
        const split = v.split('=');
        const key = split[0].replace("--", "");
        const value = split[1];
        return Object.assign(Object.assign({}, a), { [key]: value });
    }, {});
    log(isDebugMode, 'args', args);
    const overrideVariables = Object.keys(process.env).filter(w => w.startsWith("CONFIG_BUILDER_")).reduce((a, v) => {
        const key = v.replace("CONFIG_BUILDER_", "").split("_").map((w, i) => {
            if (i === 0) {
                return w.toLowerCase();
            }
            return `${w.charAt(0).toUpperCase()}${w.slice(1).toLowerCase()}`;
        }).join("");
        const value = process.env[v];
        return Object.assign(Object.assign({}, a), { [key]: value });
    }, {});
    log(isDebugMode, 'overrideVariables', overrideVariables);
    log(isDebugMode, 'finalArgs', args);
    log(isDebugMode, 'finalArgs.source', args.source);
    const source = path.join(__dirname, args.source);
    log(isDebugMode, 'source', source);
    const destination = path.join(__dirname, args.destination, path.parse(source).base);
    log(isDebugMode, 'destination', destination);
    const sourceConfig = yield Promise.resolve().then(() => __importStar(require(source)));
    log(isDebugMode, 'config to copy', JSON.stringify(sourceConfig, null, 2));
    const result = Object.assign(Object.assign({}, sourceConfig), overrideVariables);
    delete result.default;
    const configJson = JSON.stringify(result, null, 2);
    log(isDebugMode, 'after custom node vars', configJson);
    const destinationDirectory = path.dirname(destination);
    if (!fs.existsSync(destinationDirectory)) {
        fs.mkdirSync(destinationDirectory, { recursive: true });
    }
    fs.writeFileSync(destination, configJson);
    log(isDebugMode, 'complete');
});
exports.build = build;
const log = (isDebugMode, ...args) => {
    if (isDebugMode === true) {
        console.log(args);
    }
};
(0, exports.build)();
//# sourceMappingURL=config-builder.js.map