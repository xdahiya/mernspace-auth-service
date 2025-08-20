import { checkSchema } from "express-validator";

export default checkSchema({
    email: {
        trim: true,
        errorMessage: "Email is required!",
        notEmpty: true,
        isEmail: {
            errorMessage: "Email should be a valid email",
        },
    },
    password: {
        trim: true,
        errorMessage: "Password is required!",
        notEmpty: true,
        isLength: {
            options: {
                min: 8,
            },
            errorMessage: "Password length should be at least 8 chars!",
        },
    },
});
