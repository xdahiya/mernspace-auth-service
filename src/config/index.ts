import { config } from "dotenv";
import path from "path";

config({
    path: path.join(__dirname, `../../.env.${process.env.NODE_ENV || "dev"}`),
});

const {
    PORT,
    NODE_ENV,
    // DB_HOST,
    // DB_PORT,
    // DB_USERNAME,
    // DB_PASSWORD,
    // DB_NAME,
    DATABASE_URL,
    REFRESH_TOKEN_SECRET,
    PRIVATE_KEY,
    JWKS_URI,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    CLIENT_UI_DOMAIN,
    ADMIN_UI_DOMAIN,
    MAIN_DOMAIN,
    CURRENT_BACKEND_DOMAIN,
} = process.env;

export const Config2 = {
    PORT,
    NODE_ENV,
    // DB_HOST,
    // DB_PORT,
    // DB_USERNAME,
    // DB_PASSWORD,
    // DB_NAME,
    DATABASE_URL,
    REFRESH_TOKEN_SECRET,
    JWKS_URI,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    CLIENT_UI_DOMAIN,
    ADMIN_UI_DOMAIN,
    MAIN_DOMAIN,
    PRIVATE_KEY,
    CURRENT_BACKEND_DOMAIN,
};

const BACKEND_DOMAIN = CURRENT_BACKEND_DOMAIN as string;

export const Config = {
    PORT: 5501,
    NODE_ENV: NODE_ENV,
    CURRENT_BACKEND_DOMAIN:
        NODE_ENV == "dev" ? "http://localhost:5501" : BACKEND_DOMAIN,

    CLIENT_UI_DOMAIN: "http://localhost:3000",
    ADMIN_UI_DOMAIN: "http://localhost:5173",

    DATABASE_URL,
    JWKS_URI:
        NODE_ENV == "dev" || NODE_ENV == "test"
            ? JWKS_URI
            : `${BACKEND_DOMAIN}/public/.well-known/jwks.json`,

    REFRESH_TOKEN_SECRET: REFRESH_TOKEN_SECRET,
    GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID: GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: GITHUB_CLIENT_SECRET,
    PRIVATE_KEY: PRIVATE_KEY,
};
