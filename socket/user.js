// // socketHandlers.js
// exports.user = (socket) => {
// //   socket.on("join_room", (data) => {
// //     socket.join(data);
// //   });

//   socket.on("sendMessage", (data) => {
//     console.log(data);
//     //socket.to(data.room).emit("receive_message", data);
//     socket.broadcast.emit("receive_message", data);
//   });

//   socket.on("list_update", (data) => {
//     const { todoListId, updatedItem } = data;
//     console.log("list_update list_update list_update");
//     //io.emit(`list_update_${todoListId}`, updatedItem);
//   });

//   //   socket.on("sendMessage", (data) => {
//   //     console.log(data);
//   //     socket.broadcast.emit("receive_message", data);
//   //   });
// };

const user = (socket) => {
  //   socket.on("join_room", (data) => {
  //     socket.join(data);
  //   });

  socket.on("sendMessage", (data) => {
    console.log('sendMessage: '+data);
    //socket.to(data.room).emit("receive_message", data);
    socket.broadcast.emit("receive_message", data);
  });

  socket.on("list_update", (data) => {
    const { todoListId, updatedItem } = data;
    console.log("list_update list_update list_update");
    //io.emit(`list_update_${todoListId}`, updatedItem);
  });

  //   socket.on("sendMessage", (data) => {
  //     console.log(data);
  //     socket.broadcast.emit("receive_message", data);
  //   });
};

module.exports = user;
