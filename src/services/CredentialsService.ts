import bcrypt from "bcrypt";

export class CredentialsService {
    async comparePassword(userPassword: string, hashedPassword: string) {
        return await bcrypt.compare(userPassword, hashedPassword);
    }
}
