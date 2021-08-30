const { signToken } = require('../utils/auth');
const { User } = require('../models')

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            return User.findOne({ _id: context.user._id }).populate('savedBooks');
        }
//params...
    },

    Mutation: {

        addUser: async (parent, args) => {
            return User.create(args)
        },

        login : async (parent, { email, password}) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('No user with this registered with this email!');
            }
            
            const verifyPw = await user.isCorrectPassword(password);
            
            if (!verifyPw) { 
                throw new AuthenticationError('Incorrect credentials');
            }
            const token = signToken(user);

            return { token, user };
         },

         saveBook: async (parents, { savedBooks }, context) => {
            console.log(args)
            if (context.user){
            return await User.findByIdAndUpdate(
                { _id: context.user._id },
                { $addToSet: { savedBooks } },
                { new: true, runValidators: true }
              )
            };
              throw new AuthenticationError('Not logged in');
    },

        // deleteBook: async (parents, { savedBooks }, context) => {
        //     console.log(args)
        //     if(context.user) {
        //         const removeBook =  await User.findOneAndDelete(
        //             { _id: context.user._id },
        //             {$pull: { savedBooks: bookIds }}

        //         )
        //     }

        // }



         

    },
};

module.exports = resolvers;