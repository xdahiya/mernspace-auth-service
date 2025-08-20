import crypto from "crypto";

export const calculateDiscount = (price: number, percentage: number) => {
    return price * (percentage / 100);
};

export async function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateOtp() {
    const otp = crypto.randomInt(1000, 9999);
    return otp;
}

export function generateRandomPassword(length: number) {
    const charset =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+";
    const randomBytes = crypto.randomBytes(length);
    let password = "";

    for (let i = 0; i < length; i++) {
        const randomIndex = randomBytes[i] % charset.length;
        password += charset.charAt(randomIndex);
    }

    return password;
}

export const INTERFACE_TYPE = {
    ProductRepository: Symbol.for("ProductRepository"),
    ProductInteractor: Symbol.for("ProductInteractor"),
    ProductController: Symbol.for("ProductController"),
    Mailer: Symbol.for("Mailer"),
    MessageBroker: Symbol.for("MessageBroker"),
};
