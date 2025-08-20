import { NextFunction, Request, Response } from "express";

export const parseGoogleData = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const {
        given_name: firstName,
        family_name: lastName,
        email,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } = (req.user as Record<string, any>)._json;

    const Data: object = {
        firstName: firstName || "Empty",
        lastName: lastName || "Empty",
        email,
    };
    req.user = Data;
    next();
};

export const parseGithubData = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const {
        name,
        email,
    }: {
        login: string;
        name: string;
        email: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } = (req.user as Record<string, any>)._json;

    req.user = {
        firstName: name.split(" ")[0] || "Empty",
        lastName: name.split(" ")[1] || "Empty",
        email: email,
    };

    next();
    return;
};
