"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logVariables = void 0;
const logVariables = () => {
    const keys = Object.keys(process.env).sort();
    for (let key of keys) {
        console.log(`process.env.${key}=${process.env[key]}`);
    }
};
exports.logVariables = logVariables;
(0, exports.logVariables)();
//# sourceMappingURL=print-node-vars.js.map