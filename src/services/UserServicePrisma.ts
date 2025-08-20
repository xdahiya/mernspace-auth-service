import axios from "axios";
import bcrypt from "bcryptjs";
import { google } from "googleapis";
import createHttpError from "http-errors";
import { PrismaClient } from "@prisma/client";

import { Config } from "../config";
import { Roles } from "../constants";
import { generateRandomPassword } from "../utils";
import { IUserService } from "../interfaces/IUserCrud";
import { LimitedUserData, UserData, UserQueryParams } from "../types";

export class UserServicePrimsa implements IUserService {
    private prismaClient: PrismaClient;

    constructor({ prismaClient }: { prismaClient: PrismaClient }) {
        this.prismaClient = prismaClient;
    }

    async create({
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId,
    }: UserData) {
        const user = await this.prismaClient.user.findFirst({
            where: { email: email },
        });
        if (user) {
            const err = createHttpError(400, "Email is already exists!");
            throw err;
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
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
        } catch (err) {
            const error = createHttpError(
                500,
                "Failed to store the data in the database" + err,
            );
            throw error;
        }
    }

    async upsertweb3({ email, role }: { email: string; role: string }) {
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
        const hashedPassword = await bcrypt.hash("randompassword", saltRounds);
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
        } catch (err) {
            const error = createHttpError(
                500,
                "Failed to store the data in the database" + err,
            );
            throw error;
        }
    }

    async findByEmailWithPassword(email: string) {
        return await this.prismaClient.user.findFirst({
            where: {
                email,
            },
            include: {
                tenant: true,
            },
        });
    }

    async comparePassword(userPassword: string, passwordHash: string) {
        return await bcrypt.compare(userPassword, passwordHash);
    }

    async getById(id: number) {
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

    async getByIdWithoutTenant(id: number) {
        return await this.prismaClient.user.findFirst({
            where: { id: id },
        });
    }

    async update(
        userId: number,
        { firstName, lastName, role, email, tenantId }: LimitedUserData,
    ) {
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
        } catch (err) {
            const error = createHttpError(
                500,
                "Failed to update the user in the database" + err,
            );
            throw error;
        }
    }

    async updatePassword(userId: number, password: string) {
        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            return await this.prismaClient.user.update({
                where: { id: userId },
                data: {
                    password: hashedPassword,
                },
            });
        } catch (err) {
            const error = createHttpError(
                500,
                "Failed to update the user in the database" + err,
            );
            throw error;
        }
    }

    async getAll(validatedQuery: UserQueryParams) {
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

    async deleteById(userId: number) {
        return await this.prismaClient.user.delete({
            where: {
                id: userId,
            },
        });
    }

    async getUserDetails(code: string) {
        const oauth2Client = new google.auth.OAuth2(
            Config.GOOGLE_CLIENT_ID,
            Config.GOOGLE_CLIENT_SECRET,
            "postmessage",
        );
        const { tokens } = await oauth2Client.getToken(code);
        const userRes = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`,
        );
        return userRes.data;
    }

    async createSocial({
        firstName,
        lastName,
        email,
    }: {
        firstName: string;
        lastName: string;
        email: string;
    }) {
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
            const password = generateRandomPassword(12);

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            return await this.prismaClient.user.create({
                data: {
                    firstName: firstName ? firstName : "",
                    lastName: lastName ? lastName : "",
                    email,
                    isSocial: true,
                    password: hashedPassword,
                    role: Roles.CUSTOMER,
                    tenant: undefined,
                },
            });
        } catch (error) {
            const err = createHttpError(
                500,
                "Failed to store the data in the database" + error,
            );
            throw err;
        }
    }
}
