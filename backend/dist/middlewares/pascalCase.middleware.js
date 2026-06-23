"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pascalCaseMiddleware = void 0;
const convertKeysToPascalCase = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(v => convertKeysToPascalCase(v));
    }
    else if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
        return Object.keys(obj).reduce((result, key) => {
            const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
            result[pascalKey] = convertKeysToPascalCase(obj[key]);
            return result;
        }, {});
    }
    return obj;
};
const pascalCaseMiddleware = (req, res, next) => {
    const originalJson = res.json;
    res.json = function (body) {
        // Only apply if it's not an error response
        if (body && !body.status || body.status !== 'error') {
            const pascalBody = convertKeysToPascalCase(body);
            return originalJson.call(this, pascalBody);
        }
        return originalJson.call(this, body);
    };
    next();
};
exports.pascalCaseMiddleware = pascalCaseMiddleware;
