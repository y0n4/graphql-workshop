const { ApolloServer, gql } = require("apollo-server");

const frameworks = [
  {
    title: "React",
    git: "https://github.com/facebook/react/",
    stars: 104170
  },
  {
    title: "Vue",
    git: "https://github.com/vuejs/vue/",
    stars: 104483
  }
];

const typeDefs = gql`
  type framework {
    title: String
    git: String
    stars: Int
  }

  type Query {
    allFrameworks: [framework]
    Framework(title: String): framework
  }
  `

const resolvers = {
  Query: {
    allFrameworks: () => frameworks,
    Framework: (_, {title}) => {
      return frameworks.find(framework => framework.title == title)
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(data => console.log(`server started at port ${data.port}`))
