"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initOauth = initOauth;
const passport_1 = __importDefault(require("passport"));
const passport_github2_1 = require("passport-github2");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const config_1 = require("../config");
function initOauth() {
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: config_1.Config.GOOGLE_CLIENT_ID,
        clientSecret: config_1.Config.GOOGLE_CLIENT_SECRET,
        callbackURL: `${config_1.Config.CURRENT_BACKEND_DOMAIN}/auth/google/callback`,
        // scope: ['SCOPE_LIST'],
        // state: true,
        // proxy: true,
        // pkce:true,
    }, function (accessToken, refreshToken, profile, cb) {
        cb(null, profile);
    }));
    passport_1.default.use(new passport_github2_1.Strategy({
        clientID: config_1.Config.GITHUB_CLIENT_ID,
        clientSecret: config_1.Config.GITHUB_CLIENT_SECRET,
        callbackURL: `${config_1.Config.CURRENT_BACKEND_DOMAIN}/auth/github/callback`,
    }, function (accessToken, refreshToken, profile, done) {
        done(null, profile);
    }));
    // passport.serializeUser((user, done) => {
    //     done(null, user);
    //    });
    //    passport.deserializeUser((obj, done) => {
    //     done(null, obj);
    //    });
}
