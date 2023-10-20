import { checkSchema } from "express-validator";

export default checkSchema({
    email: {
        errorMessage: "Email Is Required",
        notEmpty: true,
        trim: true,
        isEmail: true,
    },
    firstName: {
        errorMessage: "firstName Is Required",
        notEmpty: true,
        trim: true,
    },
    lastName: {
        errorMessage: "lastName Is Required",
        notEmpty: true,
        trim: true,
    },
    password: {
        errorMessage: "password Is Required",
        notEmpty: true,
        trim: true,
        isLength: { options: { min: 8 } },
    },
});
