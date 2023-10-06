import { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import { UserData } from "../types";

export class UserService {
    constructor(private userRepo: Repository<User>) {}
    async create({ firstName, lastName, email, password }: UserData) {
        const userRepo = AppDataSource.getRepository(User);
        await userRepo.save({ firstName, lastName, email, password });
    }
}
