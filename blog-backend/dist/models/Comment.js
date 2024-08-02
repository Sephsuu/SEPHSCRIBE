"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const commentSchema = new mongoose_1.Schema({
    text: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    blog: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "sephscribe-Blog",
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "sephscribe-User",
    },
});
exports.default = (0, mongoose_1.model)("sephscribe-Comment", commentSchema);
//# sourceMappingURL=Comment.js.map