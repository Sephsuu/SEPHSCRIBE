const express = require('express');

const { graphqlHTTP } = require("express-graphql");
const { GraphQLInputObjectType, GraphQLID, GraphQLString, GraphQLList, GraphQLSchema, GraphQLObjectType } = require('graphql');

const app = express();

let userList = [
    { id: "1", name: "Kotoko", email: "kotoko@unis.kr" },
    { id: "2", name: "Yoona", email: "yoona@unis.kr" },
    { id: "3", name: "Nana", email: "nana@unis.kr" },
    { id: "4", name: "Hyeonju", email: "hyeonju@unis.kr" },
    { id: "5", name: "Yunha", email: "yunha@unis.kr" },
    { id: "6", name: "Seowon", email: "seowon@unis.kr" },
    { id: "7", name: "Gehlee", email: "gehlee@unis.kr" },
    { id: "8", name: "Elisia", email: "elisia@unis.kr" },
];

const UserType = new GraphQLObjectType({ 
    name: "UserType",
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
    }),
});

const RootQuery = new GraphQLObjectType({
    name: "RootQuery",
    fields: {

        // GET all users
        users: {
            type: new GraphQLList(UserType),
            resolve() {
                return userList;
            }
        },

        // GET user by ID
        user: {
            type: UserType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return userList.find((user) => user.id === args.id);
            }
        }
        
    }
});

const mutations = new GraphQLObjectType({
    name: "mutations",
    fields: {

        // POST a user
        addUser: {
            type: UserType,
            args: { 
                name: { type: GraphQLString },
                email: { type: GraphQLString },
            },
            resolve(parent, { name, email }) {
                const newUser = { name, email, id: Date.now().toString() };
                userList.push(newUser);
                return newUser;
            }
        },

        // PUT a user
        updateUser: {
            type: UserType,
            args: { 
                id: { type: GraphQLID },
                name: { type: GraphQLString },
                email: { type: GraphQLString },
            },
            resolve(parent, { id, name, email }) {
                const user= userList.find((u) => u.id === id);
                user.email = email;
                user.name = name;
                return user;
            }
        },

        // DELETE a user
        deleteUser: {
            type: UserType,
            args: { id: { type: GraphQLID } },
            resolve(parent, { id }) {
                const user = userList.find((u) => u.id === id);
                userList = userList.filter((u) => u.id !== id);
                return user;
            }
        },

    }
});

const schema = new GraphQLSchema({ query: RootQuery, mutation: mutations });

app.use("/sephscribe", graphqlHTTP({ schema, graphiql: true }));

app.listen(5000, () => console.log("Server running on Port 5000"));