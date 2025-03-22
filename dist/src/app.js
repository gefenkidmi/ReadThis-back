"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./server"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
(0, server_1.default)()
    .then((app) => {
    if (process.env.NODE_ENV !== 'production') {
        console.log("development");
        app.listen(process.env.PORT, () => {
            console.log(`App is listening at ${process.env.PORT}`);
        });
    }
    else {
        const options = {
            key: fs_1.default.readFileSync('./client-key.pem'),
            cert: fs_1.default.readFileSync('./client-cert.pem')
        };
        https_1.default.createServer(options, app).listen(process.env.PORT);
    }
});
//# sourceMappingURL=app.js.map