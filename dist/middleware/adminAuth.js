"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJwt = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const secret = process.env.SECRET;
const authenticateJwt = (req, res, next) => {
    const userAuthHeader = req.headers.authorization;
    if (!userAuthHeader) {
        return res.sendStatus(401);
    }
    const token = userAuthHeader.split(' ')[1];
    if (!token) {
        return res.sendStatus(401);
    }
    jsonwebtoken_1.default.verify(token, secret, (err, payload) => {
        if (err || !payload || typeof payload !== "object") {
            return res.sendStatus(403);
        }
        req.headers["authorId"] = payload.id;
        next();
    });
};
exports.authenticateJwt = authenticateJwt;
