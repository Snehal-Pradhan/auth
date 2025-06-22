import express from 'express';
import { createHandler } from 'graphql-http'; // This MUST be 'graphql-http', NOT a subpath
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLFloat,
  GraphQLList,
} from 'graphql';

// Construct a schema
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      quoteOfTheDay: {
        type: GraphQLString,
        resolve: () => Math.random() < 0.5 ? 'Take it easy' : 'Salvation lies within'
      },
      random: {
        type: GraphQLFloat,
        resolve: () => Math.random()
      },
      rollThreeDice: {
        type: new GraphQLList(GraphQLFloat),
        resolve: () => [1, 2, 3].map((_) => 1 + Math.floor(Math.random() * 6))
      },
    },
  }),
});

const app = express();
app.all(
  '/graphql',
  createHandler({
    schema: schema,
    graphiql: true, // This should now work correctly!
  }),
);

app.listen(4000, '127.0.0.1', () => {
  console.log('Running a GraphQL API server at http://127.0.0.1:4000/graphql');
});