import { checkSchema } from "express-validator";

export default checkSchema({
    email: {
        errorMessage: "Email Is Required",
        notEmpty: true,
    },
});
