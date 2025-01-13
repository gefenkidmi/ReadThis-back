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
const post_model_1 = __importDefault(require("../models/post_model"));
const base_controller_1 = __importDefault(require("./base_controller"));
class PostsController extends base_controller_1.default {
    constructor() {
        super(post_model_1.default);
    }
    create(req, res) {
        const _super = Object.create(null, {
            createItem: { get: () => super.createItem }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.params.userId;
            const post = Object.assign(Object.assign({}, req.body), { owner: userId });
            req.body = post;
            _super.createItem.call(this, req, res);
        });
    }
}
exports.default = new PostsController();
//# sourceMappingURL=post_controller.js.map