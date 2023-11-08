import { Repository } from "typeorm";
import { Tenant } from "../entity/Tenant";
import { ITenant } from "../types";
import createHttpError from "http-errors";

export class TenantService {
    constructor(private tenantRepo: Repository<Tenant>) {}

    async create({ name, address }: ITenant) {
        try {
            return await this.tenantRepo.save({
                name,
                address,
            });
        } catch (error) {
            const err = createHttpError(500, "failed to create tenant");
            throw err;
        }
    }
}
