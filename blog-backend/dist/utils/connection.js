"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conn = void 0;
const mongoose_1 = require("mongoose");
const conn = async () => {
    try {
        await (0, mongoose_1.connect)(`mongodb://localhost:27017/Sephscribe`);
    }
    catch (err) {
        console.log(err);
        throw new Error(err);
    }
};
exports.conn = conn;
// mongodb+srv://josephemanuelbataller:${process.env.MONGODB_PASSWORD}@sephnet.oe3yibi.mongodb.net/?retryWrites=true&w=majority&appName=SephNet
//# sourceMappingURL=connection.js.map