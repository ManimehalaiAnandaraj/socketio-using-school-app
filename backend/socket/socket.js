import Message from "../models/message.js";
import Notification from "../models/notification.js";

let users = {}; // userId -> [socketIds]

export const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

socket.on("join", (userId) => {
  if (!users[userId]) {
    users[userId] = [];
  }

  if (!users[userId].includes(socket.id)) {
    users[userId].push(socket.id);
  }

  console.log("Users:", users);
});


socket.on("sendMessage", async (data) => {
  const { senderId, receiverId, message, senderName } = data;

  try {
    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
    });

    const receiverSockets = users[receiverId];
    const senderSockets = users[senderId];

    // Send to receiver
    if (receiverSockets?.length) {
      receiverSockets.forEach((id) => {
        io.to(id).emit("receiveMessage", newMessage);
      });
    }

    // Send back to sender
    if (senderSockets?.length) {
      senderSockets.forEach((id) => {
        io.to(id).emit("receiveMessage", newMessage);
      });
    }

    // Create notification
    const notification = await Notification.create({
      receiver: receiverId,
      sender: senderId,
      senderName, // optional but useful
      text: "sent you a message",
      isRead: false,
    });
    console.log("📢 Sending notification to:", receiverId);

    // Real-time notification
    if (receiverSockets?.length) {
      receiverSockets.forEach((id) => {
       io.to(id).emit("new_notification", {
  _id: notification._id,
  senderId,
  senderName,
  text: notification.text,
  createdAt: notification.createdAt,
  isRead: false,
});
      });
    }

  } catch (err) {
    console.error("Error:", err);
  }
});

    //  DISCONNECT
    socket.on("disconnect", () => {
  Object.keys(users).forEach((userId) => {
    users[userId] = users[userId].filter(id => id !== socket.id);

    if (users[userId].length === 0) {
      delete users[userId];
    }
  });
});
  });
};