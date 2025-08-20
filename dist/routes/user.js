"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authenticate_1 = __importDefault(require("../middlewares/authenticate"));
const canAccess_1 = require("../middlewares/canAccess");
const constants_1 = require("../constants");
const create_user_validator_1 = __importDefault(require("../validators/create-user-validator"));
const update_user_validator_1 = __importDefault(require("../validators/update-user-validator"));
const list_users_validator_1 = __importDefault(require("../validators/list-users-validator"));
const container_1 = __importDefault(require("../container"));
const router = express_1.default.Router();
const container = (0, container_1.default)();
const userController = container.resolve("userController");
router.post("/", authenticate_1.default, (0, canAccess_1.canAccess)([constants_1.Roles.ADMIN]), create_user_validator_1.default, (req, res, next) => {
    userController.create(req, res, next);
});
router.patch("/:id", authenticate_1.default, (0, canAccess_1.canAccess)([constants_1.Roles.ADMIN]), update_user_validator_1.default, (req, res, next) => {
    userController.update(req, res, next);
});
router.get("/", authenticate_1.default, (0, canAccess_1.canAccess)([constants_1.Roles.ADMIN]), list_users_validator_1.default, (req, res, next) => {
    userController.getAll(req, res, next);
});
router.get("/:id", authenticate_1.default, (0, canAccess_1.canAccess)([constants_1.Roles.ADMIN]), (req, res, next) => {
    userController.getOne(req, res, next);
});
router.delete("/:id", authenticate_1.default, (0, canAccess_1.canAccess)([constants_1.Roles.ADMIN]), (req, res, next) => {
    userController.destroy(req, res, next);
});
exports.default = router;
