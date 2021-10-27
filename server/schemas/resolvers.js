const { signToken } = require("../utils/auth");
const { User } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id }).populate(
          "savedBooks"
        );
        return userData;
      }
    },
    //params...
  },

  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { token, user };
    },

    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError(
          "No user with this registered with this email!"
        );
      }

      const verifyPw = await user.isCorrectPassword(password);

      if (!verifyPw) {
        throw new AuthenticationError("Incorrect credentials");
      }
      const token = signToken(user);

      return { token, user };
    },

    saveBook: async (parents, { savedBook }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: savedBook } },
          { new: true, runValidators: true }
        );
        return updatedUser;
      }
      throw new AuthenticationError("Not logged in");
    },

    deleteBook: async (parents, args, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: args.bookId } } },
          { new: true }
        );
        return updatedUser;
      }
    },
  },
};

module.exports = resolvers;
