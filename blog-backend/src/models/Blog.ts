import { Schema , model } from "mongoose";

const blogSchema: Schema = new Schema({
    title: {
        type : String, 
        required: true,
    },
    content: {
        type : String, 
        required: true,
    },
    date: {
        type : Date, 
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "sephscribe-User",
    },
    comments: [{ 
        type: Schema.Types.ObjectId, 
        ref: "sephscribe-Comment",
    }],
});

export default model("sephscribe-Blog", blogSchema);