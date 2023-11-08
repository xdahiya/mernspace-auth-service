import { Request } from "express";

export interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}
export interface LoginUserData {
    email: string;
    password: string;
}

export interface RegisterUserRequest extends Request {
    body: UserData;
}
export interface LoginUserRequest extends Request {
    body: LoginUserData;
}

// export interface TokenPayload{
//     sub:string,
//     role:string
// }

export interface AuthRequest extends Request {
    auth: {
        sub: string;
        role: string;
        id?: string;
    };
}

export type AuthCookies = {
    accessToken: string;
    refreshToken: string;
};

export interface IRefreshTokenPayload {
    id: string;
}

export interface ITenant {
    name: string;
    address: string;
}

export interface CreateTenantRequest extends Request {
    body: ITenant;
}
