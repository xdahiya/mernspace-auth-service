import { IDBCrudBase } from "../interfaces/IDBCrudBase";
import { ITenant, TenantQueryParams } from "../types";
import { PrismaClient } from "@prisma/client";

export class TenantServicePrimsa implements IDBCrudBase {
    private prismaClient: PrismaClient;

    constructor({ prismaClient }: { prismaClient: PrismaClient }) {
        this.prismaClient = prismaClient;
    }

    async create(tenantData: ITenant) {
        return await this.prismaClient.tenant.create({
            data: tenantData,
        });
    }

    async update(id: number, tenantData: ITenant) {
        return await this.prismaClient.tenant.update({
            where: {
                id: id, // Specify the ID of the tenant to update
            },
            data: tenantData, // The updated data
        });
    }

    async getAll(validatedQuery: TenantQueryParams) {
        const { q, currentPage, perPage } = validatedQuery;

        const searchTerm = q ? `%${q}%` : null;

        const result = await this.prismaClient.tenant.findMany({
            where: searchTerm
                ? {
                      OR: [
                          { name: { contains: q, mode: "insensitive" } },
                          { address: { contains: q, mode: "insensitive" } },
                      ],
                  }
                : {},
            skip: (currentPage - 1) * perPage,
            take: perPage,
            orderBy: {
                id: "desc",
            },
        });

        const totalCount = await this.prismaClient.tenant.count({
            where: searchTerm
                ? {
                      OR: [
                          { name: { contains: q, mode: "insensitive" } },
                          { address: { contains: q, mode: "insensitive" } },
                      ],
                  }
                : {},
        });
        return { tenants: result, count: totalCount };
    }

    async getById(tenantId: number) {
        return await this.prismaClient.tenant.findFirst({
            where: { id: tenantId },
        });
    }

    async deleteById(tenantId: number) {
        return await this.prismaClient.tenant.delete({
            where: {
                id: tenantId,
            },
        });
    }
}
