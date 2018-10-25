const { ApolloServer, gql } = require("apollo-server");
const Sequelize = require("sequelize");
const axios = require("axios");
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
  name: { type: Sequelize.STRING },
  git: { type: Sequelize.STRING },
  stars: { type: Sequelize.INTEGER, defaultValue: 0 }
});
Framework.sync();

const typeDefs = gql`
  # Comments in GraphQL are defined with the hash (#) symbol.

  type Framework {
    id: String
    name: String
    git: String
    stars: Int
  }

  type Query {
    frameworks: [Framework]
  }

  type Mutation {
    addFramework(name: String, git: String): Framework
  }
`;

const resolvers = {
  Query: {
    frameworks: () => Framework.findAll()
  },
  Mutation: {
    addFramework: async (_, { name, git }) => {
      try {
        // before saving framework to postgres, we use github api to find out how many stars it has
        const frameworkURI = git.split("https://github.com/")[1];
        const url = `https://api.github.com/repos/${frameworkURI}`; //github api with params
        const githubData = await axios(url); //the information from github api
        const framework = await Framework.create({ //save to postgres
          name,
          git,
          stars: githubData.data.stargazers_count //save github api star count
        });
        return framework;
      } catch (e) {
        throw new Error(e);
      }
    }
  }
};
const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
