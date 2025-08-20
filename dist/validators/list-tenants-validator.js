"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
exports.default = (0, express_validator_1.checkSchema)({
    q: {
        trim: true,
        customSanitizer: {
            options: (value) => {
                return value ? value : "";
            },
        },
    },
    currentPage: {
        customSanitizer: {
            options: (value) => {
                const parsedValue = Number(value);
                return Number.isNaN(parsedValue) ? 1 : parsedValue;
            },
        },
    },
    perPage: {
        customSanitizer: {
            options: (value) => {
                const parsedValue = Number(value);
                return Number.isNaN(parsedValue) ? 6 : parsedValue;
            },
        },
    },
}, ["query"]);
