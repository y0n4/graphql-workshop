const { ApolloServer, gql } = require("apollo-server");
const Sequelize = require("sequelize");

require("dotenv").config({ path: "../.env" }); // import hidden code

const sequelize = new Sequelize( // connect sequelize to postgres
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

const Framework = sequelize.define("frameworks", { //create table
  name: {
    type: Sequelize.STRING
  },
  git: {
    type: Sequelize.STRING
  }
});
Framework.sync(); // important to put

const typeDefs = gql`
  type Framework {
    id: String
    name: String
    git: String
  }

  type Query {
    frameworks: [Framework]
  }

  input frameworkInput {
    name: String
    git: String
  }

  type Mutation {
    addFramework(params: frameworkInput): Framework
  }
`;

const resolvers = {
  Query: { // func to get
    frameworks: () => Framework.findAll()
  },
  Mutation: { // func thats not get (post, update, delete, etc)
    addFramework: async (_, {params: { name, git }}) => {
      const createdFramework = await Framework.create({
        name,
        git
      });
    return createdFramework;
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
