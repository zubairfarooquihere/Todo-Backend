const User = require("../models/user");
const TodoList = require("../models/todo");

const resolvers = {
  Query: {
    findUser: async (_, { email }) => {
      try {
        const users = await User.find({
          email: { $regex: new RegExp(email, "i") },
        });
        return users;
      } catch (error) {
        console.error("Error finding users:", error);
        throw error;
      }
    },
    getMemberInfo:  async (_, { todoId, userId }) => {
      try {
        console.log(userId);
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
          const team = todoList.myTeam.find(team => team.user.equals(userId));
          if (team) {
            return {
              owner: false,
              ownerName: user.name,
              readAndWrite: team.readAndWrite,
              readOnly: team.readOnly,
            };
          }
        }
        
        return { owner: true, ownerName: user.name, readAndWrite: true, readOnly: true };
      } catch (error) {
        throw new Error(`Failed to get member info: ${error.message}`);
      }
    },    
  },
  Mutation: {
    addUserToTodo: async (_, { emails, todoId }) => {
      try {
        const users = await User.find({ email: { $in: emails } });

        if (users.length !== emails.length) {
          throw new Error("One or more users not found");
        }

        const todoList = await TodoList.findById(todoId);

        if (!todoList) {
          throw new Error("Todo list not found");
        }

        users.map(async (user) => {
          // Check if the user's myTeam already includes the todoId
          if (!user.TodoList.includes(todoId)) {
            // If not included, push the todoId to the myTeam array
            user.TodoList.push(todoId);
            // Save the updated user
            await user.save();
          }
        });

        const teamObjects = users.map((user) => ({
          user: user._id,
          readAndWrite: true,
          readOnly: false,
        }));

        todoList.myTeam.push(...teamObjects);
        await todoList.save();
        const populatedTodoList = await TodoList.findById(todoId).populate(
          "myTeam.user"
        );

        return populatedTodoList.myTeam;
      } catch (error) {
        throw new Error(`Failed to add todo to user: ${error.message}`);
      }
    },
    deleteUserToTodo: async (_, { email, todoId }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new Error("User not found");
      }

      // Remove the todoId from the user's TodoList array
      user.TodoList = user.TodoList.filter((id) => id.toString() !== todoId);

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
    },
  },
};

module.exports = resolvers;
