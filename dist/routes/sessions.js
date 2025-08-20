"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authenticate_1 = __importDefault(require("../middlewares/authenticate"));
const container_1 = __importDefault(require("../container"));
const router = express_1.default.Router();
const container = (0, container_1.default)();
const sessionsController = container.resolve("sessionController");
router.get("/", authenticate_1.default, (req, res, next) => {
    sessionsController.getAll(req, res, next);
});
router.delete("/:id", authenticate_1.default, (req, res, next) => {
    sessionsController.destroy(req, res, next);
});
exports.default = router;
