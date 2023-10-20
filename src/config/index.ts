import dotenv from "dotenv";
import path from "path";

dotenv.config({
    path: path.join(__dirname, `../../.env.${process.env.NODE_ENV}`),
});
const {
    PORT,
    NODE_ENV,
    DB_HOST,
    DB_USERNAME,
    DB_PASSWORD,
    DB_PORT,
    DB_NAME,
    REFRESH_TOKEN_SECRET,
} = process.env;
export const Config = {
    PORT,
    NODE_ENV,
    DB_HOST,
    DB_USERNAME,
    DB_PASSWORD,
    DB_PORT,
    DB_NAME,
    REFRESH_TOKEN_SECRET,
};
