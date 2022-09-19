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
exports.transform = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const transformMap = {
    "not-null-string": (value) => value || "",
    "decode": (value) => decodeURIComponent(value),
    "json-parse": (value) => JSON.parse(value)
};
const transform = () => {
    const transformKeys = Object.keys(transformMap);
    // --s=../../test.json d=../../../test.json --t=one.two.three:value|json
    const args = process.argv.filter(w => w.startsWith('--'));
    const source = args.find(w => w.startsWith("--s")).replace("--s=", '');
    const destination = args.find(w => w.startsWith("--d")).replace("--d=", '');
    const transforms = args.filter(w => w.startsWith('--t')).map(w => {
        const split = w.replace('--t=', '').split('=');
        const lastColonIndex = split[1].lastIndexOf(':');
        let value = split[1];
        let transform = null;
        if (lastColonIndex > 0) {
            const transformKey = split[1].substring(lastColonIndex + 1, split[1].length);
            console.log('transformKey', transformKey);
            if (transformKeys.includes(transformKey)) {
                value = split[1].substring(0, lastColonIndex);
                console.log('value', value);
                transform = transformKey;
            }
        }
        return {
            path: split[0],
            value,
            transform
        };
    });
    console.log("transforms", JSON.stringify(transforms));
    const sourceFilePath = path.resolve(__dirname, source);
    const destinationFilePath = path.resolve(__dirname, destination);
    console.log("sourceFilePath", sourceFilePath);
    console.log("destinationFilePath", destinationFilePath);
    const data = fs.readFileSync(sourceFilePath);
    console.log("read source file");
    if (data == null) {
        throw 'source file data cannot be null or empty';
    }
    const json = JSON.parse(data.toString());
    console.log("source file parsed as JSON");
    for (let transform of transforms) {
        setNestedPath(json, transform);
    }
    const result = JSON.stringify(json, null, 2);
    console.log(`Result: ${result}`);
    fs.writeFileSync(destinationFilePath, result);
};
exports.transform = transform;
const setNestedPath = (instance, transform) => {
    if (!transform.value) {
        return;
    }
    const pathParts = transform.path.split('.');
    let result = instance;
    for (let i = 0; i < pathParts.length; i++) {
        const pathPart = pathParts[i];
        if ((i + 1) == pathParts.length) {
            const transformedValue = transformValue(transform);
            result[pathPart] = transformedValue;
            continue;
        }
        result = traverse(result, pathPart);
    }
};
const traverse = (instance, pathPart) => {
    // one.two.three
    // one.test.[0].three
    const match = pathPart.match(/\[.*\]/);
    if (match != null && match.length > 0) {
        const propertyName = pathPart.replace(match[0], '');
        const index = +match[0].replace('[', '').replace(']', '');
        return instance[propertyName][index];
    }
    return instance[pathPart];
};
const transformValue = (transform) => {
    const transformFunction = transformMap[transform.transform];
    if (transformFunction == null) {
        return transform.value;
    }
    return transformFunction(transform.value);
};
(0, exports.transform)();
//# sourceMappingURL=json-transform.js.map