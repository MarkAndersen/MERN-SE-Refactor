const { signToken } = require("../utils/auth");
const { User } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const user = User.findById({ _id: context.user._id }).populate(
          "savedBooks"
        );
        return user;
      }
    },
    //params...
  },

  Mutation: {
    addUser: async (parent, args) => {
      const User = await User.create(args);
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

    saveBook: async (parents, { savedBooks }, context) => {
      console.log(args);
      if (context.user) {
        return await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks } },
          { new: true, runValidators: true }
        );
      }
      throw new AuthenticationError("Not logged in");
    },

    deleteBook: async (parents, { savedBooks }, context) => {
      console.log(args);
      if (context.user) {
        return await User.findOneAndDelete(
          { _id: context.user._id },
          { $pull: { savedBooks: bookId } },
          { new: true }
        );
      }
    },
  },
};

module.exports = resolvers;
