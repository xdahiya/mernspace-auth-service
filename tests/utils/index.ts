import { PrismaClient } from "@prisma/client";

export const isJwt = (token: string | null): boolean => {
    if (token === null) {
        return false;
    }
    const parts = token.split(".");
    if (parts.length !== 3) {
        return false;
    }

    try {
        parts.forEach((part) => {
            Buffer.from(part, "base64").toString("utf-8");
        });
        return true;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
        return false;
    }
};

export const createTenant = async () => {
    const primsaClient = new PrismaClient();
    const tenant = await primsaClient.tenant.create({
        data: {
            name: "Test tenant",
            address: "Test address",
        },
    });
    return tenant;
};

export const getAllUsers = async () => {
    const primsaClient = new PrismaClient();
    return await primsaClient.user.findMany();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createUser = async (data: any) => {
    const primsaClient = new PrismaClient();

    return await primsaClient.user.create({
        data: data,
    });
};
