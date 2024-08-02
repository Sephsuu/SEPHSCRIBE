import { Schema , model } from "mongoose";

const userSchema: Schema = new Schema({
    name: {
        type : String, 
        required: true,
    },
    email: {
        type : String, 
        required: true,
        unique: true,
    },
    password: {
        type : String, 
        required: true,
        minLength: 8,
    },
    blogs: [{ 
        type: Schema.Types.ObjectId, 
        ref: "sephscribe-Blog", 
    }],
    comments: [{ 
        type: Schema.Types.ObjectId, 
        ref: "sephscribe-Comment",
    }],
});

export default model("sephscribe-User", userSchema);