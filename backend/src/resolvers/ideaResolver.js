import {
  AuthenticationError,
  ForbiddenError,
  UserInputError
} from 'apollo-server-express';

import * as auth from '../utils/auth';

export default {
  Query: {
    idea: (parent, args, ctx, info) => {
      // Find and return idea matching ID
      return ctx.prisma.query.idea({ where: { id: args.id } }, info);
    },

    ideas: async (parent, args, ctx, info) => {
      // Return all ideas
      return ctx.prisma.query.ideas({ orderBy: args.orderBy }, info);
    },

    ideasConnection: (parent, args, ctx, info) => {
      return ctx.prisma.query.ideasConnection({}, info);
    },

    currentUserIdea: async (parent, args, ctx, info) => {
      // If no token cookie present, throw error
      if (!ctx.req.cookies.rt)
        throw new AuthenticationError('Must be signed in.');

      // Verify cookie and decode payload
      const currentUser = auth.verifyRefreshToken(ctx.req.cookies.rt);

      // Find and return idea matching ID
      const idea = await ctx.prisma.query.idea(
        { where: { id: args.id } },
        info
      );

      // Verify current user owns idea
      const ownsIdea = currentUser.user.id === idea.author.id;

      // If not, throw error
      if (!ownsIdea) throw new ForbiddenError("That's not your idea.");

      return idea;
    },

    currentUserPaginatedIdeas: async (parent, args, ctx, info) => {
      console.log('currentUserPaginatedIdeas rt: ', ctx.req.cookies);

      // If no token cookie present, throw error
      if (!ctx.req.cookies.rt)
        throw new AuthenticationError('Must be signed in.');

      // Verify cookie and decode payload
      const userId = auth.verifyRefreshToken(ctx.req.cookies.rt);
      console.log('TCL: userId', userId);

      return await ctx.prisma.query.ideasConnection(
        { where: { author: { id: userId.userId } } },
        info
      );
    }
  },

  Mutation: {
    createIdea: (parent, args, ctx, info) => {
      // If no token cookie present, throw error
      if (!ctx.req.cookies.rt)
        throw new AuthenticationError('Must be signed in.');

      // Get current user from JWT
      const currentUser = auth.verifyRefreshToken(ctx.req.cookies.rt);

      // Call mutation
      return ctx.prisma.mutation.createIdea(
        {
          data: {
            content: args.content,
            author: { connect: { id: currentUser.user.id } }
          }
        },
        info
      );
    },

    updateIdea: async (parent, args, ctx, info) => {
      // If no token cookie present, throw error
      if (!ctx.req.cookies.rt)
        throw new AuthenticationError('Must be signed in.');

      // Get current user from JWT
      const currentUser = auth.verifyRefreshToken(ctx.req.cookies.rt);

      // Request idea's author ID using defined selection set
      const idea = await ctx.prisma.query.idea(
        { where: { id: args.id } },
        `{ author { id }}`
      );

      // Check if they own that idea
      const ownsIdea = idea.author.id === currentUser.user.id;

      // If not, throw error
      if (!ownsIdea) throw new ForbiddenError("That's not your idea.");

      // If so, call mutation
      return ctx.prisma.mutation.updateIdea({
        where: { id: args.id },
        data: { content: args.content }
      });
    },

    deleteIdea: async (parent, args, ctx, info) => {
      // If no token cookie present, throw error
      if (!ctx.req.cookies.rt)
        throw new AuthenticationError('Must be signed in.');

      // Get current user from JWT
      const currentUser = auth.verifyRefreshToken(ctx.req.cookies.rt);

      // Request idea's author ID using defined selection set
      const idea = await ctx.prisma.query.idea(
        { where: { id: args.id } },
        `{ author { id }}`
      );

      // Check if they own that idea
      const ownsIdea = idea.author.id === currentUser.user.id;

      // If not, throw error
      if (!ownsIdea) throw new ForbiddenError("That's not your idea.");

      // If so, call mutation
      return ctx.prisma.mutation.deleteIdea({ where: { id: args.id } });
    }
  }
};
