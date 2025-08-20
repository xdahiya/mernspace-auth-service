"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseGithubData = exports.parseGoogleData = void 0;
const parseGoogleData = (req, res, next) => {
    const { given_name: firstName, family_name: lastName, email,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
     } = req.user._json;
    const Data = {
        firstName: firstName || "Empty",
        lastName: lastName || "Empty",
        email,
    };
    req.user = Data;
    next();
};
exports.parseGoogleData = parseGoogleData;
const parseGithubData = (req, res, next) => {
    const { name, email, } = req.user._json;
    req.user = {
        firstName: name.split(" ")[0] || "Empty",
        lastName: name.split(" ")[1] || "Empty",
        email: email,
    };
    next();
    return;
};
exports.parseGithubData = parseGithubData;
