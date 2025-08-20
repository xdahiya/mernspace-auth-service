"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authenticate_1 = __importDefault(require("../middlewares/authenticate"));
const canAccess_1 = require("../middlewares/canAccess");
const constants_1 = require("../constants");
const tenant_validator_1 = __importDefault(require("../validators/tenant-validator"));
const list_users_validator_1 = __importDefault(require("../validators/list-users-validator"));
const container_1 = __importDefault(require("../container"));
const router = express_1.default.Router();
const container = (0, container_1.default)();
const tenantController = container.resolve("tenantController");
router.post("/", authenticate_1.default, (0, canAccess_1.canAccess)([constants_1.Roles.ADMIN]), tenant_validator_1.default, (req, res, next) => {
    tenantController.create(req, res, next);
});
router.patch("/:id", authenticate_1.default, (0, canAccess_1.canAccess)([constants_1.Roles.ADMIN]), tenant_validator_1.default, (req, res, next) => {
    tenantController.update(req, res, next);
});
router.get("/", list_users_validator_1.default, (req, res, next) => {
    tenantController.getAll(req, res, next);
});
router.get("/:id", authenticate_1.default, (0, canAccess_1.canAccess)([constants_1.Roles.ADMIN]), (req, res, next) => {
    tenantController.getOne(req, res, next);
});
router.delete("/:id", authenticate_1.default, (0, canAccess_1.canAccess)([constants_1.Roles.ADMIN]), (req, res, next) => {
    tenantController.destroy(req, res, next);
});
exports.default = router;
