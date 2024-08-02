"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const blogSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "sephscribe-User",
    },
    comments: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "sephscribe-Comment",
        }],
});
exports.default = (0, mongoose_1.model)("sephscribe-Blog", blogSchema);
//# sourceMappingURL=Blog.js.map