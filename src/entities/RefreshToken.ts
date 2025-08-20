import { User } from "./User";

// RefreshToken Entity
export class RefreshToken {
    constructor(
        public readonly id: number,
        public readonly userId: number,
        public readonly expiresAt: Date,
        public readonly user?: User,
        public readonly updatedAt?: Date,
        public readonly createdAt?: Date,
    ) {}
}
