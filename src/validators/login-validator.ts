import { checkSchema } from "express-validator";

export default checkSchema({
    email: {
        errorMessage: "Email Is Required",
        notEmpty: true,
        trim: true,
        isEmail: true,
    },
    password: {
        errorMessage: "password Is Required",
        notEmpty: true,
        trim: true,
    },
});
