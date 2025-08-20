import { RefreshToken } from "@prisma/client";
import { Tenant } from "./Tenant";

export class User {
    constructor(
        public readonly id: number,
        public readonly firstName: string,
        public readonly lastName: string,
        public readonly email: string,
        public readonly role: string,
        public readonly isSocial: boolean = false,
        public readonly password?: string,
        public readonly tenantId?: number,
        public readonly tenant?: Tenant,
        public readonly refreshTokens: RefreshToken[] = [],
        public readonly updatedAt?: Date,
        public readonly createdAt?: Date,
    ) {}
}
