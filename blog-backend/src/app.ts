import express from "express";
import { config } from "dotenv";
import { conn } from "./utils/connection";
import { graphqlHTTP } from "express-graphql";
import schema from "./handlers/handlers";

config();

const app = express();

app.use("/sephscribe", graphqlHTTP({ schema: schema, graphiql: true }));

conn().then(() =>{
    app.listen(process.env.PORT, () => 
        console.log(`Server Open on Port ${process.env.PORT}`)
    );
}).catch((err) => console.log(err));


