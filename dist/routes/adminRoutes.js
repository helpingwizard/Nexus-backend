"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
const adminAuth_1 = require("../middleware/adminAuth");
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const secret = process.env.SECRET;
exports.router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const credentials = zod_1.z.object({
    email: zod_1.z.string().min(10).max(254),
    password: zod_1.z.string().min(6).max(32),
});
exports.router.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedInput = credentials.safeParse(req.body);
    if (!parsedInput.success) {
        return res.status(400).json({ error: 'Invalid input data' });
    }
    const { email, password } = parsedInput.data;
    try {
        const admin = yield prisma.user.create({
            data: {
                email: email,
                password: password
            },
        });
        const token = jsonwebtoken_1.default.sign({ id: admin.id, role: 'admin' }, secret, { expiresIn: '1h' });
        console.log('User created successfully');
        res.status(201).json({ message: 'User created successfully', token });
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
    finally {
        yield prisma.$disconnect();
    }
}));
exports.router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedInput = credentials.safeParse(req.body);
    if (!parsedInput.success) {
        return res.status(400).json({ error: 'Invalid input data' });
    }
    const { email, password } = parsedInput.data;
    try {
        const admin = yield prisma.admin.findUnique({
            where: {
                email: email,
                password: password
            }
        });
        if (admin) {
            const token = jsonwebtoken_1.default.sign({ id: admin.id, role: 'admin' }, secret, { expiresIn: '1h' });
            res.json({ message: 'Logged in successfully', token });
        }
        else {
            res.status(403).json({ message: 'Invalid username or password' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'An error occurred while processing your request' });
    }
}));
exports.router.post('/addpost', adminAuth_1.authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { alumniName, alumniEmail, content, linkedIn, college, startup } = req.body;
    let authorId = ((_a = req.headers["authorId"]) === null || _a === void 0 ? void 0 : _a.toString()) || "";
    try {
        const post = yield prisma.post.create({
            data: {
                alumniEmail: alumniEmail,
                alumniName: alumniName,
                content: content,
                linkedIn: linkedIn,
                college: college,
                startup: startup,
                authorId: parseInt(authorId)
            }
        });
        res.status(201).json(post);
    }
    catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
exports.router.put('/updatepost/:id', adminAuth_1.authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const { alumniName, alumniEmail, content, linkedIn, college, startup } = req.body;
        let authorId = ((_b = req.headers["authorId"]) === null || _b === void 0 ? void 0 : _b.toString()) || "";
        const postId = parseInt(req.params.id, 10);
        const post = yield prisma.post.update({
            where: {
                id: postId
            },
            data: {
                alumniName: alumniName,
                alumniEmail: alumniEmail,
                content: content,
                linkedIn: linkedIn,
                college: college,
                startup: startup
            }
        });
        res.status(200).json(post);
    }
    catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ error: 'Failed to update post' });
    }
}));
exports.router.post('/deletePost/:id', adminAuth_1.authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = parseInt(req.params.id, 10);
        const deletepost = yield prisma.user.delete({
            where: {
                id: postId,
            },
        });
        res.status(200).json({ message: 'Post deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to delete post', error: error.message });
    }
}));
exports.router.get('/posts', adminAuth_1.authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield prisma.post.findMany({});
        res.status(201).send({ posts });
    }
    catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).send({ error: 'Failed to fetch posts' });
    }
}));
exports.router.get('/post/:postId', adminAuth_1.authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.params.postId;
    const post = yield prisma.post.findUnique({
        where: {
            id: parseInt(postId)
        }
    });
    if (post) {
        res.json({ post });
    }
    else {
        res.status(404).json({ message: 'Post not found' });
    }
}));
exports.default = exports.router;
