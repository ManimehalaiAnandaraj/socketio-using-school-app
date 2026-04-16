import React, { useEffect, useState, useRef } from "react";
import { Input, Button,Space } from "antd";
import socket from '../../socket/socket.js'
import { useSelector } from "react-redux";

const ChatWindow = ({ selectedUser }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const currentUser = useSelector((state) => state.auth.user);
  const bottomRef = useRef();

  useEffect(() => {
  const fetchMessages = async () => {
    if (!currentUser?._id || !selectedUser?._id) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/messages?senderId=${currentUser._id}&receiverId=${selectedUser._id}`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };

  fetchMessages();
}, [currentUser, selectedUser]);

  /* SOCKET */
  useEffect(() => {
    if (!currentUser?._id) return;

    socket.emit("join", currentUser._id);

    const handler = (data) => {
  setMessages((prev) => {
    const exists = prev.some(
      (msg) =>
        msg.message === data.message &&
        msg.senderId === data.senderId &&
        msg.receiverId === data.receiverId
    );

    if (exists) return prev;
    return [...prev, data];
  });
};

    socket.off("receiveMessages");
    socket.on("receiveMessage",handler);

    return () => socket.off("receiveMessage", handler);
  }, [currentUser?._id]);

  /* FILTER */
  const filteredMessages = messages.filter(
    (msg) =>
      selectedUser &&
      ((msg.senderId === currentUser._id &&
        msg.receiverId === selectedUser._id) ||
        (msg.senderId === selectedUser._id &&
          msg.receiverId === currentUser._id))
  );

  /* Auto Scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filteredMessages]);

  /* Send */
  const sendMessage = () => {
  if (!message.trim() || !selectedUser) return;

  const msgData = {
    senderId: currentUser._id,
    receiverId: selectedUser._id,
    message,
  };

  socket.emit("sendMessage", msgData);

  setMessage("");
};
  if (!selectedUser) {
    return <div className="chat-window empty">Select a user</div>;
  }

  return (
    <div className="chat-window">
      {/* HEADER */}
      <div className="chat-header">
        {selectedUser.name}
      </div>

      {/* MESSAGES */}
      <div className="chat-messages">
        {filteredMessages.map((msg, i) => (
          <div
            key={i}
            className={`msg ${
              msg.senderId === currentUser._id ? "me" : "them"
            }`}
          >
            {msg.message}
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      {/* INPUT */}
      <div className="chat-input">
        <Space.Compact style={{ width: "100%" }}>
  <Input
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    placeholder="Type message..."
  />
  <Button type="primary" onClick={sendMessage}>
    Send
  </Button>
</Space.Compact>
      </div>
    </div>
  );
};

export default ChatWindow;