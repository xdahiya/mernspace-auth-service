"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.INTERFACE_TYPE = exports.calculateDiscount = void 0;
exports.delay = delay;
exports.generateOtp = generateOtp;
exports.generateRandomPassword = generateRandomPassword;
const crypto_1 = __importDefault(require("crypto"));
const calculateDiscount = (price, percentage) => {
    return price * (percentage / 100);
};
exports.calculateDiscount = calculateDiscount;
async function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
async function generateOtp() {
    const otp = crypto_1.default.randomInt(1000, 9999);
    return otp;
}
function generateRandomPassword(length) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+";
    const randomBytes = crypto_1.default.randomBytes(length);
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = randomBytes[i] % charset.length;
        password += charset.charAt(randomIndex);
    }
    return password;
}
exports.INTERFACE_TYPE = {
    ProductRepository: Symbol.for("ProductRepository"),
    ProductInteractor: Symbol.for("ProductInteractor"),
    ProductController: Symbol.for("ProductController"),
    Mailer: Symbol.for("Mailer"),
    MessageBroker: Symbol.for("MessageBroker"),
};
