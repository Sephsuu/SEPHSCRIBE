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
            ref: "sephscribe-Comment",
        }],
});
exports.default = (0, mongoose_1.model)("sephscribe-User", userSchema);
//# sourceMappingURL=User.js.map