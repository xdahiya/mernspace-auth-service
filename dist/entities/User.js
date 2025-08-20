"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    id;
    firstName;
    lastName;
    email;
    role;
    isSocial;
    password;
    tenantId;
    tenant;
    refreshTokens;
    updatedAt;
    createdAt;
    constructor(id, firstName, lastName, email, role, isSocial = false, password, tenantId, tenant, refreshTokens = [], updatedAt, createdAt) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
        this.isSocial = isSocial;
        this.password = password;
        this.tenantId = tenantId;
        this.tenant = tenant;
        this.refreshTokens = refreshTokens;
        this.updatedAt = updatedAt;
        this.createdAt = createdAt;
    }
}
exports.User = User;
