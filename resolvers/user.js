const User = require("../models/user");
const TodoList = require("../models/todo");
const auth = require("./middleware/is-authGraph");

const resolvers = {
  Query: {
    findUser: async (_, { email, userId }, context) => {
      try {
        const token = context.req.headers.authorization;
        auth(token)
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
        console.log('todoId: '+todoId);
        const token = context.req.headers.authorization;
        auth(token)
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
        const token = context.req.headers.authorization;
        auth(token)
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
        //const token = context.req.headers.authorization;
        //auth(token);
        console.log('addUserToTodo');
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
          await todoList.save();
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
          await todoList.save();
        }
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
        auth(token)
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
  },
};

module.exports = resolvers;
