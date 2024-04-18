const User = require("../models/user");
const Comment = require("../models/comment");
const TodoList = require("../models/todo");
const jwt = require("jsonwebtoken");
//const isAuth = require('../middleware/is-auth');

const auth = (authHeader) => {
  if (!authHeader) {
    throw new Error("No authorization header provided. Access denied.");
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "somesupersecretsecret");
  } catch (err) {
    throw new Error("Invalid or expired token. Authentication failed.");
  }
  if (!decodedToken) {
    throw new Error("Token verification failed. User not authenticated.");
  }
};

const resolvers = {
  Query: {
    findUser: async (_, { email, userId }, context) => {
      try {
        const token = context.req.headers.authorization;
        auth(token);

        const users = await User.find({
          email: { $regex: new RegExp(email, "i") },
          _id: { $ne: userId }, // Exclude users with the specified userId
        });

        return users;
      } catch (error) {
        console.error("Error finding users:", error);
        throw error;
      }
    },
    getMemberInfo: async (_, { todoId, userId }, context) => {
      try {
        const token = context.req.headers.authorization;
        //console.log(token);
        auth(token);
        const todoList = await TodoList.findById(todoId);
        if (!todoList) {
          throw new Error("Todo list not found");
        }

        const user = await User.findById(todoList.userId); //user who created
        let owner = false;
        if (user._id.toString() === userId) {
          //console.log(user._id.toString());
          owner = true;
        } else {
          const team = todoList.myTeam.find((team) => team.user.equals(userId));
          if (team) {
            return {
              owner: false,
              ownerName: user.name,
              readAndWrite: team.readAndWrite,
              readOnly: team.readOnly,
            };
          }
        }

        return {
          owner: true,
          ownerName: user.name,
          readAndWrite: true,
          readOnly: false,
        };
      } catch (error) {
        throw new Error(`Failed to get member info: ${error.message}`);
      }
    },
    getComments: async (_, { todoId }, context) => {
      try {
        // Find the TodoList by its ID and populate the 'comments' field
        const todoList = await TodoList.findById(todoId).populate('comments');
        
        if (!todoList) {
          throw new Error("Todo list not found");
        }
    
        // Extract the comments array from the populated 'todoList' object
        const comments = todoList.comments;
    
        return comments;
      } catch (error) {
        throw new Error(`Failed to get comments: ${error.message}`);
      }
    }
  },
  Mutation: {
    addUserToTodo: async (
      _,
      { currentTeam, newTeam, todoId, userId },
      context
    ) => {
      try {
        const token = context.req.headers.authorization;
        auth(token);

        const userInfo = await resolvers.Query.getMemberInfo(
          _,
          { todoId, userId },
          context
        );

        if (!userInfo.owner && !userInfo.readAndWrite) {
          throw new Error(
            "User does not have permission to perform this action"
          );
        }

        const todoList = await TodoList.findById(todoId);
        if (!todoList) {
          throw new Error("Todo list not found");
        }
        if(currentTeam.length > 0){
          for (const teamMember of currentTeam) {
            const user = await User.findById(teamMember.user._id);
            if (!user) {
              throw new Error(`User with ID ${teamMember.user._id} not found`);
            }
            const teamIndex = todoList.myTeam.findIndex((member) =>
              member.user.equals(user._id)
            );
            if (teamIndex !== -1) {
              todoList.myTeam[teamIndex].readAndWrite = teamMember.readAndWrite;
              todoList.myTeam[teamIndex].readOnly = teamMember.readOnly;
            }
          }

        }

        if (newTeam.length > 0) {
          for (const teamMember of newTeam) {
            const user = await User.findById(teamMember.user._id);
            if (!user) {
              throw new Error(`User with ID ${teamMember.user._id} not found`);
            }
            if (!user.TodoList.includes(todoId)) {
              // Add todoId to user's TodoList
              user.TodoList.push(todoId);
              await user.save();
              // Add user to TodoList's myTeam
              todoList.myTeam.push({
                user: user._id,
                readAndWrite: teamMember.readAndWrite,
                readOnly: teamMember.readOnly,
              });
            }
          }
        }
        await todoList.save();

        // const populatedTodoList = await TodoList.findById(todoId).populate({
        //   path: 'myTeam.user',
        //   model: 'User' // Specify the model to populate from
        // });

        return [...currentTeam, ...newTeam];
      } catch (error) {
        throw new Error(`Failed to add todo to user: ${error.message}`);
      }
    },
    deleteUserToTodo: async (_, { email, todoId, userId }, context) => {
      try {
        const token = context.req.headers.authorization;
        auth(token);
        const userInfo = await resolvers.Query.getMemberInfo(
          _,
          { todoId, userId },
          context
        );
        if (userInfo.owner || userInfo.readAndWrite) {
          const user = await User.findOne({ email });
          if (!user) {
            throw new Error("User not found");
          }
          // Remove the todoId from the user's TodoList array
          user.TodoList = user.TodoList.filter(
            (id) => id.toString() !== todoId
          );
          // Save the updated user
          await user.save();
          // Find the TodoList with the specified ID
          const todoList = await TodoList.findById(todoId);
          if (!todoList) {
            throw new Error("Todo list not found");
          }
          // Remove the user from the myTeam array in TodoList
          todoList.myTeam = todoList.myTeam.filter(
            (team) => team.user.toString() !== user._id.toString()
          );
          // Save the updated TodoList
          await todoList.save();
          const populatedTodoList = await TodoList.findById(todoId).populate(
            "myTeam.user"
          );
          // Return a success message or any other desired response
          return populatedTodoList.myTeam;
        }
        throw new Error("No Permission");
      } catch (error) {
        throw new Error(`Failed to delete user from todo: ${error.message}`);
      }
    },
    addComment: async (_, { todoId, comment, userId }, context) => {
      try {
        // Create a new Comment document
        const newComment = new Comment({
          comment: comment,
          userId: userId,
        });
        // Save the new comment to the database
        const savedComment = await newComment.save();
        // Find the TodoList with the given todoId
        const todoList = await TodoList.findById(todoId);
        if (!todoList) {
          throw new Error("Todo list not found");
        }
        // Add the newly created comment to the todoList's comments array
        todoList.comments.push(savedComment);
        // Save the updated TodoList document
        await todoList.save();
        // Return the saved comment
        return {userId, comment: savedComment.comment, _id: savedComment._id};
      } catch (error) {
        throw new Error(`Failed to add comment: ${error.message}`);
      }
    },
    deleteComment: async (_, { commentId, todoId }, context) => {
      try {
        // Find the comment by its ID
        const comment = await Comment.findById(commentId);
        if (!comment) {
          // If the comment doesn't exist, return an error or handle accordingly
          throw new Error('Comment not found');
        }
    
        // Remove the comment
        await comment.deleteOne();
        // The middleware in the Comment model will take care of removing it from associated TodoLists
        console.log('Comment removed successfully');

        const todoList = await TodoList.findById(todoId);
        if (!todoList) {
          throw new Error("Todo list not found");
        }

        return commentId;
      } catch (error) {
        console.error('Error removing comment:', error);
      }
    },
  },
};

module.exports = resolvers;
