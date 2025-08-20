"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshToken = void 0;
// RefreshToken Entity
class RefreshToken {
    id;
    userId;
    expiresAt;
    user;
    updatedAt;
    createdAt;
    constructor(id, userId, expiresAt, user, updatedAt, createdAt) {
        this.id = id;
        this.userId = userId;
        this.expiresAt = expiresAt;
        this.user = user;
        this.updatedAt = updatedAt;
        this.createdAt = createdAt;
    }
}
exports.RefreshToken = RefreshToken;
