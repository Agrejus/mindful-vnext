"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.set = void 0;
const set = () => {
    const args = process.argv.filter(w => w.startsWith('--')).map(w => {
        const split = w.replace('--', '').split('=');
        return { name: split[0], value: split[1] };
    });
    for (let arg of args) {
        console.log(`##vso[task.setvariable variable=${arg.name};isOutput=true]${arg.value}`);
    }
};
exports.set = set;
(0, exports.set)();
//# sourceMappingURL=set-dynamic-variable.js.map