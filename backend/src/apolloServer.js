import { ApolloServer } from 'apollo-server-express';
import { importSchema } from 'graphql-import';
const prisma = require('./prismaClient');
import resolvers from './resolvers';
import * as auth from '../utils/auth';

// const typeDefs = importSchema('src/schema/schema.graphql');
const typeDefs = importSchema(__dirname + '/schema/schema.graphql');

const dev = process.env.NODE_ENV === 'development';

export default () =>
  new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req, res }) => {
      // const me = await auth.getMe(req.cookies);

      return { req, res, prisma };
    },
    tracing: dev,
    introspection: dev,
    playground: dev
      ? {
          settings: {
            'editor.theme': 'light'
            // 'request.credentials': 'include'
          }
        }
      : false
  });
