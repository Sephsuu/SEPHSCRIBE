import { GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLNonNull, GraphQLID, GraphQLBoolean } from "graphql";
import { BlogType, CommentType, UserType } from "../schema/schema";
import User from "../models/User";
import Blog from "../models/Blog";
import Comment from "../models/Comment";
import { Document, startSession } from "mongoose";
import { hashSync, compareSync } from "bcryptjs"; 

type DocumentType = Document<any, any, any>;

const RootQuery = new GraphQLObjectType({
    name: "RootQuery",
    fields: {

        // GET all users
        users: {
            type: GraphQLList(UserType),
            async resolve() {
                return await User.find();
            }
        },

        // GET all blogs
        blogs: {
            type: GraphQLList(BlogType),
            async resolve() {
                return await Blog.find()
            }
        },

        // GET all comments
        comments: {
            type: GraphQLList(CommentType),
            async resolve() {
                return await Comment.find()
            }
        },

    },
});

const mutations = new GraphQLObjectType({
    name: "mutations",
    fields: {

        // User signup
        signup: {
            type: UserType,
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                email: { type: GraphQLNonNull(GraphQLString) },
                password: { type: GraphQLNonNull(GraphQLString) },
            },
            async resolve(parent, { name, email, password }) {
                let existingUser: DocumentType;
                try {
                    existingUser = await User.findOne({ email: email });
                    if (existingUser) return new Error("User already exists");
                    const encryptedPassword = hashSync(password);
                    const user = new User({ name, email, password: encryptedPassword });
                    return await user.save();
                } catch(err) {
                    return new Error("Error on signing up a user. Please try again.");
                }
            }
        },

        // User login
        login: {
            type: UserType,
            args: {
                email: { type: GraphQLNonNull(GraphQLString) },
                password: { type: GraphQLNonNull(GraphQLString) },
            },
            async resolve(parent, { email, password }) {
                let existingUser: DocumentType;
                try {
                    existingUser = await User.findOne({ email });
                    if (!existingUser) return new Error("No user found");
                    const decryptedPassword = compareSync(
                        password, 
                        // @ts-ignore
                        existingUser?.password);
                        if (!decryptedPassword) return new Error("Incorrect Password");
                        return existingUser;
                } catch(err) {
                        return new Error(err);
                }
            }
        },

        // Creating a blog
        createBlog: {
            type: BlogType,
            args: {
                title: { type: GraphQLNonNull(GraphQLString) },
                content: { type: GraphQLNonNull(GraphQLString) },
                date: { type: GraphQLNonNull(GraphQLString) }, 
                user: { type: GraphQLNonNull(GraphQLID) },
            },
            async resolve(parent, { title, content, date, user}) {
                let blog: Document<any, any, any>;
                const session = await startSession();
                try {
                    blog = new Blog({ title, content, date, user });
                    const blogAuthor = await User.findById(user);
                    if (!blogAuthor) return new Error("User not found");
                    session.startTransaction({ session });
                    // blogAuthor.blogs.push(blog);
                    await blogAuthor.save({ session });
                    return await blog.save();
                } catch(err) {
                    return new Error(err);
                } finally {
                    session.commitTransaction();
                }
            }
        },

        // Update a blog
        updateBlog: {
            type: BlogType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) },
                title: { type: GraphQLNonNull(GraphQLString) },
                content: { type: GraphQLNonNull(GraphQLString) },
            },
            async resolve(parent, { id, title, content }) {
                let existingBlog: DocumentType;
                try {
                    existingBlog = await Blog.findById(id);
                    if (!existingBlog) return new Error("Blog not found");
                    return await Blog.findByIdAndUpdate(id, {
                        title, 
                        content,
                    }, { new: true });
                } catch(err) {
                    return new Error(err);
                }
            }
        },

        // Delete a blog
        deleteBlog: {
            type: BlogType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) }
            },
            async resolve(parent, { id }) {
                let existingBlog: DocumentType;
                const session = await startSession();
                try {
                    session.startTransaction();
                    existingBlog = await Blog.findById(id).populate("user");
                    //@ts-ignore
                    const existingUser = existingBlog?.user;
                    if (!existingUser) return new Error("No user linked to this blog");
                    if (!existingBlog) return new Error("Blog not found");
                    existingUser.blogs.pull(existingBlog);
                    await existingUser.save({ session });
                    return await Blog.findByIdAndDelete(id);
                } catch(err) {
                    return new Error(err);
                } finally {
                    session.commitTransaction();
                }
            }
        },

        // Delete all blogs
        deleteAllBlogs: {
            type: GraphQLBoolean,
            async resolve() {
                try {
                    await Blog.deleteMany({});
                    return true;
                } catch (err) {
                    throw new Error('Failed to delete all blogs');
                }
            },
        },

        addCommentToBlog: {
            type: CommentType,
            args: {
                text: { type: GraphQLNonNull(GraphQLString) },
                date: { type: GraphQLNonNull(GraphQLString) },
                user: { type: GraphQLNonNull(GraphQLID) },
                blog: { type: GraphQLNonNull(GraphQLID) },
            }, 
            async resolve(parent, { text, date, user, blog }) {
                const session = await startSession();
                session.startTransaction();
                let comment: DocumentType;
                try {
                    const existingUser = await User.findById(user).session(session);
                    const existingBlog = await Blog.findById(blog).session(session);
                    if (!existingUser || !existingBlog) {
                        throw new Error("User or Blog not exist");
                    }
                    comment = new Comment({ text, date, user, blog });
                    await existingUser.save({ session });
                    await existingBlog.save({ session });
                    await comment.save({ session });
                    await session.commitTransaction();
                    return comment;
                } catch (err) {
                    await session.abortTransaction();
                    throw new Error(err);
                } finally {
                    session.endSession();
                }
            }
        },

        // Delete ccomment from a blog 
        deleteComment: {
            type: CommentType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID )}
            },
            async resolve(parent, { id }) {
                let comment: DocumentType;
                const session = await startSession();
                try {
                    session.startTransaction({ session });
                    comment = await Comment.findById(id);
                    if (!comment) return new Error("Comment not found");
                    //@ts-ignore
                    const existingUser = comment?.user;
                    if (!existingUser) return new Error("User not found");
                    console.log(existingUser);
                    //@ts-ignore
                    const existingBlog = comment?.blog;
                    console.log(existingBlog);
                    if (!existingBlog) return new Error("Blog not found");
                    await comment.save({ session });
                    return await Comment.findByIdAndDelete(id);
                } catch(err) {
                    return new Error(err);
                } finally {
                    await session.commitTransaction();
                }
            }
        }

    }
})

export default new GraphQLSchema({ query: RootQuery, mutation: mutations });