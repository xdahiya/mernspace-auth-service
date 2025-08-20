"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
exports.default = (0, express_validator_1.checkSchema)({
    name: {
        trim: true,
        errorMessage: "Tenant name is required!",
        notEmpty: true,
    },
    address: {
        trim: true,
        errorMessage: "Tenant address is required!",
        notEmpty: true,
    },
});
