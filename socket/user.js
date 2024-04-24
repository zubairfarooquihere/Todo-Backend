const user = (socket) => {
  socket.on("sendMessage", (data) => {
    console.log('sendMessage: '+data);
    socket.broadcast.emit("receive_message", data);
  });

  socket.on("list_update", (data) => {
    const { todoListId, updatedItem } = data;
    console.log("list_update list_update list_update");
  });
};

module.exports = user;
