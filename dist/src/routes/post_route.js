"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const post_controller_1 = __importDefault(require("../controllers/post_controller"));
const auth_middleware_1 = __importDefault(require("../common/auth_middleware"));
const file_middleware_1 = __importDefault(require("../common/file_middleware"));
/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: The Posts managing API
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         _id:
 *           type: string
 *           example: 60d0fe4f5311236168a109ca
 *         title:
 *           type: string
 *           example: My First Post
 *         content:
 *           type: string
 *           example: This is the content of the post.
 *         owner:
 *           type: string
 *           example: 60d0fe4f5311236168a109ca
 */
const router = express_1.default.Router();
/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts
 *     description: Retrieves a list of all posts
 *     tags:
 *       - Posts
 *     responses:
 *       '200':
 *         description: A list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       '500':
 *         description: Internal server error
 */
router.get("/", post_controller_1.default.getAll.bind(post_controller_1.default));
/**
 * @swagger
 * /posts/pages:
 *   get:
 *     summary: Get all posts
 *     description: Retrieves a list of all posts - paged
 *     tags:
 *       - Posts
 *     responses:
 *       '200':
 *         description: A list of posts - from all paged
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       '500':
 *         description: Internal server error
 */
router.get("/paged", post_controller_1.default.getAllPaged.bind(post_controller_1.default));
/**
 * @swagger
 * /posts/my-posts:
 *   get:
 *     summary: Get logged-in user's posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: User's posts fetched successfully
 */
router.get("/my-posts", auth_middleware_1.default, post_controller_1.default.getMyPosts);
/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     description: Retrieves a post by its ID
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     responses:
 *       '200':
 *         description: A single post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       '404':
 *         description: Post not found
 *       '500':
 *         description: Internal server error
 */
router.get("/:id", post_controller_1.default.getById.bind(post_controller_1.default));
/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     description: Creates a new post
 *     tags:
 *       - Posts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       '201':
 *         description: The created post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       '400':
 *         description: Invalid input
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal server error
 */
router.post("/", file_middleware_1.default.single("image"), post_controller_1.default.create);
/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post by ID
 *     description: Deletes a post by its ID
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     responses:
 *       '200':
 *         description: Post deleted successfully
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Post not found
 *       '500':
 *         description: Internal server error
 */
router.delete("/:id", auth_middleware_1.default, post_controller_1.default.deletePost.bind(post_controller_1.default));
/**
 * @swagger
 * /posts/like/{id}:
 *   post:
 *     summary: Like a post
 *     description: Like a post
 *     tags:
 *       - Posts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       '201':
 *         description: Post liked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       '400':
 *         description: Invalid input
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal server error
 */
router.post("/like/:id", auth_middleware_1.default, post_controller_1.default.like.bind(post_controller_1.default));
/**
 * @swagger
 * /posts/unlike/{id}:
 *   post:
 *     summary: Unlike a post
 *     description: Unlike a post
 *     tags:
 *       - Posts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       '201':
 *         description: Post unliked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       '400':
 *         description: Invalid input
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal server error
 */
router.post("/unlike/:id", auth_middleware_1.default, post_controller_1.default.unlike.bind(post_controller_1.default));
/**
 * @swagger
 * /posts/comment/{id}:
 *   post:
 *     summary: Add new comment to post
 *     description: Add new comment to post
 *     tags:
 *       - Posts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       '201':
 *         description: The comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       '400':
 *         description: Invalid input
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal server error
 */
router.post("/comment/:id", auth_middleware_1.default, post_controller_1.default.addComment.bind(post_controller_1.default));
/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a user's post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Post updated successfully
 */
router.put("/:id", auth_middleware_1.default, file_middleware_1.default.single("image"), post_controller_1.default.updatePost);
exports.default = router;
//# sourceMappingURL=post_route.js.map