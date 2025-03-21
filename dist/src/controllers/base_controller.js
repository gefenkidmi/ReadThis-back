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
Object.defineProperty(exports, "__esModule", { value: true });
class BaseController {
    constructor(model) {
        this.model = model;
    }
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = req.query.owner;
            try {
                if (filter) {
                    const posts = yield this.model.find({ owner: filter });
                    res.send(posts);
                }
                else {
                    const posts = yield this.model.find();
                    res.send(posts);
                }
            }
            catch (error) {
                res.status(400).send(error);
            }
        });
    }
    getAllPopulated(req, res, path, select) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const obj = yield this.model.find().populate(path, select);
                if (!obj)
                    res.status(404);
                res.send(obj);
            }
            catch (error) {
                console.log(error);
                res.status(500).send(error);
            }
        });
    }
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const postId = req.params.id;
            try {
                const post = yield this.model.findById(postId);
                console.log(post);
                if (post != null) {
                    res.send(post);
                }
                else {
                    res.status(404).send("Post not found");
                }
            }
            catch (error) {
                res.status(400).send(error);
            }
        });
    }
    getByIdPopulated(req, res, path, select) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const obj = yield this.model
                    .findById(req.params.id)
                    .populate(path, select);
                if (!obj)
                    res.status(404);
                res.send(obj);
            }
            catch (error) {
                console.log(error);
                res.status(500).send(error);
            }
        });
    }
    createItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const postBody = req.body;
            try {
                const post = yield this.model.create(postBody);
                res.status(201).send(post);
            }
            catch (error) {
                res.status(400).send(error);
            }
        });
    }
    deleteItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const postId = req.params.id;
            try {
                const rs = yield this.model.findByIdAndDelete(postId);
                res.status(200).send(rs);
            }
            catch (error) {
                res.status(400).send(error);
            }
        });
    }
}
exports.default = BaseController;
//# sourceMappingURL=base_controller.js.map