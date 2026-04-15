import Message from "../models/message.js";

let users = {}; // userId -> [socketIds]

export const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    //  JOIN
    socket.on("join", (userId) => {
      if (!users[userId]) {
        users[userId] = [];
      }
      users[userId].push(socket.id);

      console.log("Users:", users);
    });

    //  SEND MESSAGE
    socket.on("sendMessage", async (data) => {
      const { senderId, receiverId, message } = data;

      try {
        // SAVE TO DB
        const newMessage = await Message.create({
          senderId,
          receiverId,
          message,
        });

        //  SEND TO RECEIVER
        const receiverSockets = users[receiverId];
        if (receiverSockets) {
          receiverSockets.forEach((id) => {
            io.to(id).emit("receiveMessage", newMessage);
          });
        }

        //  SEND BACK TO SENDER (IMPORTANT)
        const senderSockets = users[senderId];
        if (senderSockets) {
          senderSockets.forEach((id) => {
            io.to(id).emit("receiveMessage", newMessage);
          });
        }

      } catch (err) {
        console.error("Error saving message:", err);
      }
    });

    //  DISCONNECT
    socket.on("disconnect", () => {
      for (let userId in users) {
        users[userId] = users[userId].filter(id => id !== socket.id);

        if (users[userId].length === 0) {
          delete users[userId];
        }
      }
    });
  });
};