import { Repository } from "typeorm";
import { User } from "../entity/User";
import { UserData } from "../types";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";

export class UserService {
    constructor(private userRepo: Repository<User>) {}

    async create({ firstName, lastName, email, password, role }: UserData) {
        const user = await this.userRepo.findOne({ where: { email: email } });
        if (user) {
            const err = createHttpError(400, "email already exists");
            throw err;
        }
        const hashedpassword = await bcrypt.hash(password, 10);
        try {
            return await this.userRepo.save({
                firstName,
                lastName,
                email,
                password: hashedpassword,
                role: role,
            });
        } catch (error) {
            const err = createHttpError(500, "failed to create user");
            throw err;
        }
    }

    async findByEmail(email: string) {
        return await this.userRepo.findOne({
            where: {
                email,
            },
        });
    }

    async findById(id: number) {
        return await this.userRepo.findOne({
            where: {
                id,
            },
        });
    }
}
