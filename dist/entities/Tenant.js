"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tenant = void 0;
class Tenant {
    id;
    name;
    address;
    users;
    updatedAt;
    createdAt;
    constructor(id, name, address, users = [], updatedAt, createdAt) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.users = users;
        this.updatedAt = updatedAt;
        this.createdAt = createdAt;
    }
}
exports.Tenant = Tenant;
