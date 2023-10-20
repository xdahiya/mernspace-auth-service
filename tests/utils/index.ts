import { DataSource } from "typeorm";

export const truncateTables = async (connection: DataSource) => {
    const entities = connection.entityMetadatas;
    for (const entity of entities) {
        const repo = connection.getRepository(entity.name);
        await repo.clear();
    }
};

export const isJwt = (jwttoken: string | null): boolean => {
    if (jwttoken == null) {
        return false;
    }
    const parts = jwttoken.split(".");
    if (parts.length != 3) {
        return false;
    }
    try {
        parts.forEach((part) => {
            Buffer.from(part, "base64").toString("utf-8");
        });
        return true;
    } catch (error) {
        return false;
    }
};
