"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./server"));
(0, server_1.default)()
    .then((app) => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
    .catch((error) => {
    console.error("Failed to initialize app:", error);
    process.exit(1);
});
//# sourceMappingURL=app.js.map