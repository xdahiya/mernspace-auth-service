import { User } from "./User";

export class Tenant {
    constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly address: string,
        public readonly users: User[] = [],
        public readonly updatedAt?: Date,
        public readonly createdAt?: Date,
    ) {}
}
