import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Config } from "../config";

export function initOauth() {
    passport.use(
        new GoogleStrategy(
            {
                clientID: Config.GOOGLE_CLIENT_ID!,
                clientSecret: Config.GOOGLE_CLIENT_SECRET!,
                callbackURL: `${Config.CURRENT_BACKEND_DOMAIN}/auth/google/callback`,
                // scope: ['SCOPE_LIST'],
                // state: true,
                // proxy: true,
                // pkce:true,
            },
            function (accessToken, refreshToken, profile, cb) {
                cb(null, profile);
            },
        ),
    );

    passport.use(
        new GitHubStrategy(
            {
                clientID: Config.GITHUB_CLIENT_ID!,
                clientSecret: Config.GITHUB_CLIENT_SECRET!,
                callbackURL: `${Config.CURRENT_BACKEND_DOMAIN}/auth/github/callback`,
            },
            function (
                accessToken: string,
                refreshToken: string,
                profile: unknown,
                done: (error: unknown, data: unknown) => void,
            ) {
                done(null, profile);
            },
        ),
    );

    // passport.serializeUser((user, done) => {
    //     done(null, user);
    //    });
    //    passport.deserializeUser((obj, done) => {
    //     done(null, obj);
    //    });
}
