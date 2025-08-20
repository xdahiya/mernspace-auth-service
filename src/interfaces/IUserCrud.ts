import { IDBCrudBase } from "./IDBCrudBase";
import { User } from "@prisma/client";

export interface IUserService extends IDBCrudBase {
    findByEmailWithPassword(email: string): Promise<User | null>;
    createSocial(input: {
        firstName: string;
        lastName: string;
        email: string;
    }): Promise<User | null>;
}
