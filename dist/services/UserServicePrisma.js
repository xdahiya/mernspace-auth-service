"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServicePrimsa = void 0;
const axios_1 = __importDefault(require("axios"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const googleapis_1 = require("googleapis");
const http_errors_1 = __importDefault(require("http-errors"));
const config_1 = require("../config");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
class UserServicePrimsa {
    prismaClient;
    constructor({ prismaClient }) {
        this.prismaClient = prismaClient;
    }
    async create({ firstName, lastName, email, password, role, tenantId, }) {
        const user = await this.prismaClient.user.findFirst({
            where: { email: email },
        });
        if (user) {
            const err = (0, http_errors_1.default)(400, "Email is already exists!");
            throw err;
        }
        const saltRounds = 10;
        const hashedPassword = await bcryptjs_1.default.hash(password, saltRounds);
        try {
            return await this.prismaClient.user.create({
                data: {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: hashedPassword,
                    role: role,
                    tenantId: tenantId,
                },
            });
        }
        catch (err) {
            const error = (0, http_errors_1.default)(500, "Failed to store the data in the database" + err);
            throw error;
        }
    }
    async upsertweb3({ email, role }) {
        const user = await this.prismaClient.user.findFirst({
            where: { email: email },
        });
        if (user) {
            return await this.prismaClient.user.findFirst({
                where: {
                    email: email,
                },
            });
        }
        const saltRounds = 10;
        const hashedPassword = await bcryptjs_1.default.hash("randompassword", saltRounds);
        try {
            return await this.prismaClient.user.create({
                data: {
                    firstName: "firstName",
                    lastName: "lastName",
                    email: email,
                    password: hashedPassword,
                    role: role,
                },
            });
        }
        catch (err) {
            const error = (0, http_errors_1.default)(500, "Failed to store the data in the database" + err);
            throw error;
        }
    }
    async findByEmailWithPassword(email) {
        return await this.prismaClient.user.findFirst({
            where: {
                email,
            },
            include: {
                tenant: true,
            },
        });
    }
    async comparePassword(userPassword, passwordHash) {
        return await bcryptjs_1.default.compare(userPassword, passwordHash);
    }
    async getById(id) {
        return await this.prismaClient.user.findFirst({
            where: { id: id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                tenant: true,
                enable2FA: true,
                isEmailVerified: true,
                isSocial: true,
            },
        });
    }
    async getByIdWithoutTenant(id) {
        return await this.prismaClient.user.findFirst({
            where: { id: id },
        });
    }
    async update(userId, { firstName, lastName, role, email, tenantId }) {
        try {
            return await this.prismaClient.user.update({
                where: { id: userId },
                data: {
                    firstName,
                    lastName,
                    role,
                    email,
                    tenantId: tenantId ? tenantId : null,
                },
            });
        }
        catch (err) {
            const error = (0, http_errors_1.default)(500, "Failed to update the user in the database" + err);
            throw error;
        }
    }
    async updatePassword(userId, password) {
        try {
            const saltRounds = 10;
            const hashedPassword = await bcryptjs_1.default.hash(password, saltRounds);
            return await this.prismaClient.user.update({
                where: { id: userId },
                data: {
                    password: hashedPassword,
                },
            });
        }
        catch (err) {
            const error = (0, http_errors_1.default)(500, "Failed to update the user in the database" + err);
            throw error;
        }
    }
    async getAll(validatedQuery) {
        const { q, role, currentPage, perPage } = validatedQuery;
        const searchTerm = q ? `%${q}%` : null;
        const result = await this.prismaClient.user.findMany({
            where: {
                AND: [
                    searchTerm
                        ? {
                            OR: [
                                {
                                    firstName: {
                                        contains: q,
                                        mode: "insensitive",
                                    },
                                },
                                {
                                    lastName: {
                                        contains: q,
                                        mode: "insensitive",
                                    },
                                },
                                {
                                    email: {
                                        contains: q,
                                        mode: "insensitive",
                                    },
                                },
                            ],
                        }
                        : {},
                    role
                        ? {
                            role: role,
                        }
                        : {},
                ],
            },
            include: {
                tenant: true,
            },
            skip: (currentPage - 1) * perPage,
            take: perPage,
            orderBy: {
                id: "desc",
            },
        });
        const totalCount = await this.prismaClient.user.count({
            where: {
                AND: [
                    searchTerm
                        ? {
                            OR: [
                                {
                                    firstName: {
                                        contains: q,
                                        mode: "insensitive",
                                    },
                                },
                                {
                                    lastName: {
                                        contains: q,
                                        mode: "insensitive",
                                    },
                                },
                                {
                                    email: {
                                        contains: q,
                                        mode: "insensitive",
                                    },
                                },
                            ],
                        }
                        : {},
                    role
                        ? {
                            role: role,
                        }
                        : {},
                ],
            },
        });
        return { users: result, count: totalCount };
    }
    async deleteById(userId) {
        return await this.prismaClient.user.delete({
            where: {
                id: userId,
            },
        });
    }
    async getUserDetails(code) {
        const oauth2Client = new googleapis_1.google.auth.OAuth2(config_1.Config.GOOGLE_CLIENT_ID, config_1.Config.GOOGLE_CLIENT_SECRET, "postmessage");
        const { tokens } = await oauth2Client.getToken(code);
        const userRes = await axios_1.default.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`);
        return userRes.data;
    }
    async createSocial({ firstName, lastName, email, }) {
        try {
            const existingUser = await this.prismaClient.user.findFirst({
                where: {
                    email,
                },
            });
            if (existingUser) {
                return existingUser;
            }
            // const password = "Pass@123";
            const password = (0, utils_1.generateRandomPassword)(12);
            const saltRounds = 10;
            const hashedPassword = await bcryptjs_1.default.hash(password, saltRounds);
            return await this.prismaClient.user.create({
                data: {
                    firstName: firstName ? firstName : "",
                    lastName: lastName ? lastName : "",
                    email,
                    isSocial: true,
                    password: hashedPassword,
                    role: constants_1.Roles.CUSTOMER,
                    tenant: undefined,
                },
            });
        }
        catch (error) {
            const err = (0, http_errors_1.default)(500, "Failed to store the data in the database" + error);
            throw err;
        }
    }
}
exports.UserServicePrimsa = UserServicePrimsa;
