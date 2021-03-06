import bcrypt from 'bcryptjs';
import {
  AuthenticationError,
  _ForbiddenError,
  _UserInputError
} from 'apollo-server-express';
import mailPasswordResetToken from '../utils/mail';
import {
  createRefreshToken,
  sendRefreshToken,
  createAccessToken
} from '../utils/auth';
import * as auth from '../utils/auth';
import * as config from '../config';

export default {
  Query: {
    user: (parent, args, ctx, info) => {
      // If no access token, throw error
      if (!ctx.accessToken) throw new AuthenticationError('Must be signed in.');

      // Verify access token
      auth.verifyAccessToken(ctx.accessToken);

      // Find and return user matching ID
      return ctx.prisma.query.user({ where: { id: args.id } }, info);
    },

    users: (parent, args, ctx, info) => {
      // If no access token, throw error
      if (!ctx.accessToken) throw new AuthenticationError('Must be signed in.');

      // Verify access token
      auth.verifyAccessToken(ctx.accessToken);

      // Return all users
      return ctx.prisma.query.users({ orderBy: args.orderBy }, info);
    },

    usersConnection: (parent, args, ctx, info) => {
      // If no access token, throw error
      if (!ctx.accessToken) throw new AuthenticationError('Must be signed in.');

      // Verify access token
      auth.verifyAccessToken(ctx.accessToken);

      // Return all users
      return ctx.prisma.query.usersConnection({}, info);
    },

    currentUser: async (parent, args, ctx, info) => {
      // If no access token, return nothing
      if (!ctx.accessToken) return null;

      // Verify access token and decode payload
      const payload = auth.verifyAccessToken(ctx.accessToken);

      // Find user matching userId
      const user = await ctx.prisma.query.user(
        { where: { id: payload.userId } },
        info
      );

      // If no user found, return nothing
      if (!user) return null;

      // Return user
      return user;
    }
  },

  Mutation: {
    signUp: async (parent, args, ctx, info) => {
      // Normalize email
      const email = args.email.toLowerCase();

      // Check if email address is well-formed
      auth.validateEmail(email);

      // Find user matching email
      const user = await ctx.prisma.query.user({ where: { email } });

      // If user found, return error
      if (user)
        throw new AuthenticationError(`An account already exists for ${email}`);

      // Check if password is well-formed
      auth.validatePassword(args.password);

      // Check if user confirmed password correctly
      auth.comparePasswords(args.password, args.confirmPassword);

      // Encrypt password
      const password = await bcrypt.hash(args.password, config.saltRounds);

      // Create user
      const newUser = await ctx.prisma.mutation.createUser({
        data: { email, password }
      });

      // Create refresh token
      const refreshToken = createRefreshToken(
        newUser.id,
        newUser.refreshTokenVersion
      );

      // Send a new refresh token cookie
      sendRefreshToken(ctx.res, refreshToken);

      // Create access token
      const accessToken = createAccessToken(newUser.id);

      // Return access token and user data
      return {
        accessToken,
        user: { id: newUser.id, email: newUser.email, ideas: newUser.ideas }
      };
    },

    signIn: async (parent, args, ctx, info) => {
      // Normalize email
      const email = args.email.toLowerCase();

      // Find user matching email
      const user = await ctx.prisma.query.user({ where: { email } });

      // If user not found, return error
      if (!user) throw new AuthenticationError(`No account found for ${email}`);

      // Check if typed password matches users password
      await auth.checkPassword(args.password, user.password);

      // Create refresh token
      const refreshToken = createRefreshToken(
        user.id,
        user.refreshTokenVersion
      );

      // Send a new refresh token cookie
      sendRefreshToken(ctx.res, refreshToken);

      // Create access token
      const accessToken = createAccessToken(user.id);

      // Return access token and user data
      return {
        accessToken,
        user: { id: user.id, email: user.email, ideas: user.ideas }
      };
    },

    signOut: (parent, args, ctx, info) => {
      // Clear cookie
      ctx.res.clearCookie('rt');

      // Return boolean
      return true;
    },

    requestReset: async (parent, args, ctx, info) => {
      // Normalize email
      const email = args.email.toLowerCase();

      // Find user matching email
      const user = await ctx.prisma.query.user({ where: { email } });

      // If user not found, return error
      if (!user) throw new AuthenticationError(`No account found for ${email}`);

      // Generate password reset token
      const {
        resetToken,
        resetTokenExpiry
      } = await auth.createPasswordResetToken();

      // Update user with reset token
      ctx.prisma.mutation.updateUser({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry }
      });

      // Send mail with reset link
      mailPasswordResetToken(email, resetToken, resetTokenExpiry);

      // Return boolean
      return true;
    },

    resetPassword: async (parent, args, ctx, info) => {
      // Check if password meet requirements
      auth.validatePassword(args.password);

      // Check if password matches confirm password
      auth.comparePasswords(args.password, args.confirmPassword);

      // Get user from resetToken
      const [user] = await ctx.prisma.query.users({
        where: { resetToken: args.resetToken }
      });

      // Return error if user not found
      if (!user)
        throw new AuthenticationError(
          'Error: Please submit a new password reset request.'
        );

      // Check if token is expired
      auth.validateResetTokenExpiry(user.resetTokenExpiry);

      // Encrypt new password
      const password = await bcrypt.hash(args.password, config.saltRounds);

      // Update user with new password and clear resetToken
      ctx.prisma.mutation.updateUser({
        where: { id: user.id },
        data: { password, resetToken: null, resetTokenExpiry: null }
      });

      // Return boolean
      return true;
    },

    revokeRefreshToken: async (parent, args, ctx, info) => {
      // Get user
      const user = await ctx.prisma.query.user({ where: { id: args.id } });

      // Increment refresh token version
      const incrementedVersion = user.refreshTokenVersion + 1;

      // Update refresh token version
      ctx.prisma.mutation.updateUser({
        where: { id: user.id },
        data: { refreshTokenVersion: incrementedVersion }
      });

      // Return boolean
      return true;
    }
  }
};
