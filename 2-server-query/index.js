require("dotenv").config({ path: "../.env" });
const { ApolloServer, gql } = require("apollo-server");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  `postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${
    process.env.DB_HOST
  }:5432/${process.env.DB}`,
  {
    ssl: true,
    dialectOptions: {
      ssl: true
    }
  }
);

// define what type of data is gonna be stored in database
const Framework = sequelize.define("frameworks", {
  name: {
    type: Sequelize.STRING
  },
  git: {
    type: Sequelize.STRING
  }
});

// define what type of data expected from graphql
const typeDefs = gql`
  type Framework {
    id: String
    name: String
    git: String
  }

  type Query {
    frameworks: [Framework]
  }
`;

// functions to use when calling on graphql playground
const resolvers = {
  Query: {
    frameworks: () => Framework.findAll() // returns everything in  database (sequelize func)
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
