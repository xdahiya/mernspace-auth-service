import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const email = "admin1@gmail.com";
    const password = "Admin1@123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
        data: {
            firstName: "admin",
            lastName: "1",
            email: email,
            password: hashedPassword,
            role: "admin",
        },
    });

    // eslint-disable-next-line no-console
    console.log("Admin user created:", admin);
}

main()
    .catch((e) => {
        // eslint-disable-next-line no-console
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
