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
