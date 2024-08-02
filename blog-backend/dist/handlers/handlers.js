"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const schema_1 = require("../schema/schema");
const User_1 = __importDefault(require("../models/User"));
const Blog_1 = __importDefault(require("../models/Blog"));
const Comment_1 = __importDefault(require("../models/Comment"));
const mongoose_1 = require("mongoose");
const bcryptjs_1 = require("bcryptjs");
const RootQuery = new graphql_1.GraphQLObjectType({
    name: "RootQuery",
    fields: {
        // GET all users
        users: {
            type: (0, graphql_1.GraphQLList)(schema_1.UserType),
            async resolve() {
                return await User_1.default.find();
            }
        },
        // GET all blogs
        blogs: {
            type: (0, graphql_1.GraphQLList)(schema_1.BlogType),
            async resolve() {
                return await Blog_1.default.find();
            }
        },
        // GET all comments
        comments: {
            type: (0, graphql_1.GraphQLList)(schema_1.CommentType),
            async resolve() {
                return await Comment_1.default.find();
            }
        },
    },
});
const mutations = new graphql_1.GraphQLObjectType({
    name: "mutations",
    fields: {
        // User signup
        signup: {
            type: schema_1.UserType,
            args: {
                name: { type: (0, graphql_1.GraphQLNonNull)(graphql_1.GraphQLString) },
                email: { type: (0, graphql_1.GraphQLNonNull)(graphql_1.GraphQLString) },
                password: { type: (0, graphql_1.GraphQLNonNull)(graphql_1.GraphQLString) },
            },
            async resolve(parent, { name, email, password }) {
                let existingUser;
                try {
                    existingUser = await User_1.default.findOne({ email: email });
                    if (existingUser)
                        return new Error("User already exists");
                    const encryptedPassword = (0, bcryptjs_1.hashSync)(password);
                    const user = new User_1.default({ name, email, password: encryptedPassword });
                    return await user.save();
                }
                catch (err) {
                    return new Error("Error on signing up a user. Please try again.");
                }
            }
        },
        // User login
        login: {
            type: schema_1.UserType,
            args: {
                email: { type: (0, graphql_1.GraphQLNonNull)(graphql_1.GraphQLString) },
                password: { type: (0, graphql_1.GraphQLNonNull)(graphql_1.GraphQLString) },
            },
            async resolve(parent, { email, password }) {
                let existingUser;
                try {
                    existingUser = await User_1.default.findOne({ email });
                    if (!existingUser)
                        return new Error("No user found");
                    const decryptedPassword = (0, bcryptjs_1.compareSync)(password, 
                    // @ts-ignore
                    existingUser?.password);
                    if (!decryptedPassword)
                        return new Error("Incorrect Password");
                    return existingUser;
                }
                catch (err) {
                    return new Error(err);
                }
            }
        },
        // Creating a blog
        createBlog: {
            type: schema_1.BlogType,
            args: {
                title: { type: (0, graphql_1.GraphQLNonNull)(graphql_1.GraphQLString) },
                content: { type: (0, graphql_1.GraphQLNonNull)(graphql_1.GraphQLString) },
                date: { type: (0, graphql_1.GraphQLNonNull)(graphql_1.GraphQLString) },
                user: { type: (0, graphql_1.GraphQLNonNull)(graphql_1.GraphQLID) },
            },
            async resolve(parent, { title, content, date, user }) {
                let blog;
                const session = await (0, mongoose_1.startSession)();
                try {
                    blog = new Blog_1.default({ title, content, date, user });
                    const blogAuthor = await User_1.default.findById(user);
                    if (!blogAuthor)
                        return new Error("User not found");
                    session.startTransaction({ session });
                    // blogAuthor.blogs.push(blog);
                    await blogAuthor.save({ session });
                    return await blog.save();
                }
                catch (err) {
                    return new Error(err);
                }
                finally {
                    session.commitTransaction();
                }
            }
        },
        // Update a blog
        updateBlog: {
            type: schema_1.BlogType,
            args: {
                id: { type: (0, graphql_1.GraphQLNonNull)(graphql_1.GraphQLID) },
                title: { type: (0, graphql_1.GraphQLNonNull)(graphql_1.GraphQLString) },
                content: { type: (0, graphql_1.GraphQLNonNull)(graphql_1.GraphQLString) },
            },
            async resolve(parent, { id, title, content }) {
                let existingBlog;
                try {
                    existingBlog = await Blog_1.default.findById(id);
                    if (!existingBlog)
                        return new Error("Blog not found");
                    return await Blog_1.default.findByIdAndUpdate(id, {
                        title,
                        content,
                    }, { new: true });
                }
                catch (err) {
                    return new Error(err);
                }
            }
        },
        // Delete a blog
        deleteBlog: {
            type: schema_1.BlogType,
            args: {
                id: { type: (0, graphql_1.GraphQLNonNull)(graphql_1.GraphQLID) }
            },
            async resolve(parent, { id }) {
                let existingBlog;
                const session = await (0, mongoose_1.startSession)();
                try {
                    session.startTransaction();
                    existingBlog = await Blog_1.default.findById(id).populate("user");
                    //@ts-ignore
                    const existingUser = existingBlog?.user;
                    if (!existingUser)
                        return new Error("No user linked to this blog");
                    if (!existingBlog)
                        return new Error("Blog not found");
                    existingUser.blogs.pull(existingBlog);
                    await existingUser.save({ session });
                    return await Blog_1.default.findByIdAndDelete(id);
                }
                catch (err) {
                    return new Error(err);
                }
                finally {
                    session.commitTransaction();
                }
            }
        },
        // Delete all blogs
        deleteAllBlogs: {
            type: graphql_1.GraphQLBoolean,
            async resolve() {
                try {
                    await Blog_1.default.deleteMany({});
                    return true;
                }
                catch (err) {
                    throw new Error('Failed to delete all blogs');
                }
            },
        },
        addCommentToBlog: {
            type: schema_1.CommentType,
            args: {
                text: { type: (0, graphql_1.GraphQLNonNull)(graphql_1.GraphQLString) },
                date: { type: (0, graphql_1.GraphQLNonNull)(graphql_1.GraphQLString) },
                user: { type: (0, graphql_1.GraphQLNonNull)(graphql_1.GraphQLID) },
                blog: { type: (0, graphql_1.GraphQLNonNull)(graphql_1.GraphQLID) },
            },
            async resolve(parent, { text, date, user, blog }) {
                const session = await (0, mongoose_1.startSession)();
                session.startTransaction();
                let comment;
                try {
                    const existingUser = await User_1.default.findById(user).session(session);
                    const existingBlog = await Blog_1.default.findById(blog).session(session);
                    if (!existingUser || !existingBlog) {
                        throw new Error("User or Blog not exist");
                    }
                    comment = new Comment_1.default({ text, date, user, blog });
                    await existingUser.save({ session });
                    await existingBlog.save({ session });
                    await comment.save({ session });
                    await session.commitTransaction();
                    return comment;
                }
                catch (err) {
                    await session.abortTransaction();
                    throw new Error(err);
                }
                finally {
                    session.endSession();
                }
            }
        },
        // Delete ccomment from a blog 
        deleteComment: {
            type: schema_1.CommentType,
            args: {
                id: { type: (0, graphql_1.GraphQLNonNull)(graphql_1.GraphQLID) }
            },
            async resolve(parent, { id }) {
                let comment;
                const session = await (0, mongoose_1.startSession)();
                try {
                    session.startTransaction({ session });
                    comment = await Comment_1.default.findById(id);
                    if (!comment)
                        return new Error("Comment not found");
                    //@ts-ignore
                    const existingUser = comment?.user;
                    if (!existingUser)
                        return new Error("User not found");
                    console.log(existingUser);
                    //@ts-ignore
                    const existingBlog = comment?.blog;
                    console.log(existingBlog);
                    if (!existingBlog)
                        return new Error("Blog not found");
                    await comment.save({ session });
                    return await Comment_1.default.findByIdAndDelete(id);
                }
                catch (err) {
                    return new Error(err);
                }
                finally {
                    await session.commitTransaction();
                }
            }
        }
    }
});
exports.default = new graphql_1.GraphQLSchema({ query: RootQuery, mutation: mutations });
//# sourceMappingURL=handlers.js.map