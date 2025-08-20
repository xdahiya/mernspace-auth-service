import { User } from "../entities/User";

export interface IUserInteractor {
    create(input: User): User;
    update(id: number, stock: number): void;
    getAll(limit: number, offset: number): User[];
}
