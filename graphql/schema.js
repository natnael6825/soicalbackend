// graphql/schema.js
const { GraphQLSchema, GraphQLObjectType } = require("graphql");
const { RootQuery, Mutation } = require("./resolvers");

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: RootQuery
  }),
  mutation: new GraphQLObjectType({
    name: "Mutation",
    fields: Mutation
  })
});
