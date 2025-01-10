import express from "express";
const router = express.Router();
import commentsController from "../controllers/comments_controller";

/**
* @swagger
* tags:
*   name: Comments
*   description: The Comments managing API
*/


/**
 * @swagger
 * components:
 *   schemas:
 *     Comments:
 *       type: object
 *       required:
 *         - comment
 *         - owner
 *         - postId
 *       properties:
 *         _id:
 *           type: string
 *           example: 60d0fe4f5311236168a109ca
 *         comment:
 *           type: string
 *           example: My First Comment
 *         owner:
 *           type: string
 *           example: Ziv Klein.
 *         postId:
 *           type: string
 *           example: 60d0fe4f5311236168a109ca
 */

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Get all comments
 *     description: Retrieves a list of all comments
 *     tags:
 *       - Comments
 *     responses:
 *       '200':
 *         description: A list of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       '500':
 *         description: Internal server error
 */
router.get("/", commentsController.getAll.bind(commentsController));


/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Get a comment by ID
 *     description: Retrieves a comment by its ID
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The comment ID
 *     responses:
 *       '200':
 *         description: A single comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       '404':
 *         description: Comment not found
 *       '500':
 *         description: Internal server error
 */
router.get("/:id", commentsController.getById.bind(commentsController));

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Add a new comment
 *     description: Add a new comment
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       '201':
 *         description: The created comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       '400':
 *         description: Invalid input
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal server error
 */
router.post("/", commentsController.createItem.bind(commentsController));

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment by ID
 *     description: Deletes a comment by its ID
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The comment ID
 *     responses:
 *       '200':
 *         description: Comment deleted successfully
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Comment not found
 *       '500':
 *         description: Internal server error
 */
router.delete("/:id", commentsController.deleteItem.bind(commentsController));

export default router;