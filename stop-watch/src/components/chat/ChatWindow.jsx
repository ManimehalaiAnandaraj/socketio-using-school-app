import React, { useEffect, useState, useRef } from "react";
import { Input, Button, Space } from "antd";
import socket from "../../socket/socket.js";
import { useSelector } from "react-redux";

const ChatWindow = ({ selectedUser, onOpenSidebar }) => {
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
          { credentials: "include" }
        );
        if (!res.ok) return;
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Error loading messages:", err);
      }
    };
    fetchMessages();
  }, [currentUser?._id, selectedUser?._id]);

  useEffect(() => {
    if (!currentUser?._id) return;
    socket.emit("join", currentUser._id);
    const handler = (data) => {
      setMessages((prev) => {
        const exists = prev.some(
          (msg) =>
            msg._id === data._id ||
            (msg.message === data.message &&
              msg.senderId === data.senderId &&
              msg.receiverId === data.receiverId)
        );
        if (exists) return prev;
        return [...prev, data];
      });
    };
    socket.off("receiveMessage");
    socket.on("receiveMessage", handler);
    return () => socket.off("receiveMessage", handler);
  }, [currentUser?._id]);

  const filteredMessages = messages.filter(
    (msg) =>
      selectedUser &&
      currentUser &&
      ((msg.senderId === currentUser._id && msg.receiverId === selectedUser._id) ||
        (msg.senderId === selectedUser._id && msg.receiverId === currentUser._id))
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filteredMessages]);

  const sendMessage = () => {
    if (!message.trim() || !selectedUser || !currentUser) return;
    socket.emit("sendMessage", {
      senderId: currentUser._id,
      receiverId: selectedUser._id,
      message,
    });
    setMessage("");
  };

  if (!currentUser)
    return <div className="chat-window empty">Please login to chat</div>;

  if (!selectedUser)
    return <div className="chat-window empty">Select a user to start chatting</div>;

  return (
    <div className="chat-window">
      {/* HEADER — back button is INSIDE here */}
      <div className="chat-header">
        <button className="back-btn" onClick={onOpenSidebar}>‹</button>
        {selectedUser.name}
      </div>

      <div className="chat-messages">
        {filteredMessages.map((msg) => (
          <div
            key={msg._id}
            className={`msg ${msg.senderId === currentUser._id ? "me" : "them"}`}
          >
            {msg.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input">
        <Space.Compact style={{ width: "100%" }}>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onPressEnter={sendMessage}
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