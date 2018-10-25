const { ApolloServer, gql } = require("apollo-server");
const Sequelize = require("sequelize");

require("dotenv").config({ path: "../.env" });

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

const Framework = sequelize.define("frameworks", {
  name: {
    type: Sequelize.STRING
  },
  git: {
    type: Sequelize.STRING
  }
});
Framework.sync();

const typeDefs = gql`
  # Comments in GraphQL are defined with the hash (#) symbol.

  type Framework {
    id: String
    name: String
    git: String
  }

  type Query {
    frameworks: [Framework]
  }

  type Mutation {
    addFramework(name: String, git: String): Framework
    # there is a method called findById that will return a Framework and then you can use that Framework to call destroy on it

    removeFramework(id: ID): Framework
  }
`;

const resolvers = {
  Query: {
    frameworks: () => Framework.findAll()
  },
  Mutation: {
    addFramework: async (_, { name, git }) => {
      try {
        const framework = await Framework.create({
          name,
          git
        });

        return framework;
      } catch (e) {
        throw new Error(e);
      }
    },
    removeFramework: async(_, {id}) => { // delete framework w given id
      try {
        const removed =  await Framework.findById(id);
        removed.destroy(); // delete framework
        return removed; // good practice to always return what you deleted from database
      } catch (e) { throw new Error(e)}
    }
  }
};
const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
