"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minLength: 8,
    },
    blogs: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "sephscribe-Blog",
        }],
    comments: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "sephscribeComment",
        }],
});
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
            types: mongoose_1.Schema.Types.ObjectId,
            ref: "sephscribe-Comment",
        }]
});
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
exports.default = (0, mongoose_1.model)("sephscribe-User", userSchema);
exports.default = (0, mongoose_1.model)("sephscribe-Blog", blogSchema);
exports.default = (0, mongoose_1.model)("sephscribe-Comment", commentSchema);
//# sourceMappingURL=Models.js.map