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
exports.googleAuth = void 0;
const users_model_1 = __importDefault(require("../models/users_model"));
const google_auth_library_1 = require("google-auth-library");
const users_controller_1 = __importDefault(require("./users_controller"));
const client = new google_auth_library_1.OAuth2Client();
const googleAuth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ticket = yield client.verifyIdToken({
            idToken: req.body.credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const email = payload === null || payload === void 0 ? void 0 : payload.email;
        const name = payload === null || payload === void 0 ? void 0 : payload.name;
        const picture = payload === null || payload === void 0 ? void 0 : payload.picture;
        if (!email) {
            res.status(401).send("Email missing from Google token");
            return;
        }
        let user = yield users_model_1.default.findOne({ email });
        if (!user) {
            const username = (name === null || name === void 0 ? void 0 : name.replace(/\s+/g, "").toLowerCase()) || email.split("@")[0];
            user = yield users_model_1.default.create({
                email,
                username,
                password: "google-auth",
                imageUrl: picture,
            });
        }
        const tokens = yield users_controller_1.default.generateToken(user._id);
        res.status(200).send(Object.assign({ _id: user._id, username: user.username, email: user.email, imageUrl: user.imageUrl }, tokens));
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});
exports.googleAuth = googleAuth;
//# sourceMappingURL=google_controller.js.map