const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const { ApolloServer } = require('apollo-server-express');
const cors = require('cors')
const typeDefs = require('./schema/index');
const resolvers = require('./resolvers/index');

const app = express();
app.use(cors());

const todoRoutes = require("./routes/todo");
const authRoutes = require('./routes/auth');

app.use(express.urlencoded({extended: true,}));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(bodyParser.json());

app.use("/todo", todoRoutes);
app.use("/auth", authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

const startServer = async() => {
  try {
    //const app = express();
    const server = new ApolloServer({ typeDefs, resolvers, graphiql: true,  context: ({ req }) => ({ req }) });

    await server.start();
    server.applyMiddleware({ app });

    // app.use(cors())
    
    // app.get('/', (req, res) => {
    //   res.send('Hello from REST API!');
    // });

    app.listen({ port: 8080 }, () =>
      console.log(`Server ready at http://localhost:8080${server.graphqlPath}`)
    );
  } catch (error) {
    console.error('Error starting the server:', error);
  }
}

mongoose
  .connect("mongodb/todo")
  .then((result) => {
    //app.listen(8080);
    startServer();
  })
  .catch((err) => console.log(err));
