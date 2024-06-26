//git push origin main
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const { ApolloServer } = require("apollo-server-express");
const cors = require("cors");
const typeDefs = require("./schema/index");
const resolvers = require("./resolvers/index");

const setupSocket  = require("./socket/index");
const http = require("http");
const { Server } = require("socket.io");

const helmet = require("helmet");
var compression = require('compression')

const app = express();
app.use(cors());

app.use(helmet());
app.use(compression())

const todoRoutes = require("./routes/todo");
const authRoutes = require("./routes/auth");

app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
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

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const startServer = async () => {
  try {
    const Apolloserver = new ApolloServer({
      typeDefs,
      resolvers,
      graphiql: true,
      context: ({ req }) => ({ req }),
    });

    await Apolloserver.start();
    Apolloserver.applyMiddleware({ app });
    setupSocket(httpServer);

    const port = process.env.PORT || 8080; //{ process.env.PORT || port: 8080 }
    httpServer.listen(port, () =>
      console.log(
        `Server ready at http://localhost:8080${Apolloserver.graphqlPath}`
      )
    );
  } catch (error) {
    console.error("Error starting the server:", error);
  }
};

mongoose
  .connect( `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.t1iooe7.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`) //${process.env.MONGO_USER}
  .then((result) => {
    //app.listen(8080);
    startServer();
  })
  .catch((err) => console.log(err));

  module.exports = httpServer;