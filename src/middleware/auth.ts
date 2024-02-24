import { NextFunction, Request, Response} from "express";
import jwt, { Secret } from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();
const secret = process.env.SECRET as Secret;


export const authenticateJwt = (req: Request, res: Response, next: NextFunction) => {
    const userAuthHeader = req.headers.authorization;

    if (!userAuthHeader) {
        return res.sendStatus(401);
    }

    const token = userAuthHeader.split(' ')[1];
    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, secret, (err, payload) => {
        if (err || !payload || typeof payload !== "object") {
            return res.sendStatus(403);
        }

        next();
    });
};
