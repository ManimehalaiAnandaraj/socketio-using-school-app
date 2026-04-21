import React, { useState } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";

const ChatLayout = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="chat-app">
      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <ChatSidebar
        open={sidebarOpen}
        onSelectUser={(user) => {
          setSelectedUser(user);
          setSidebarOpen(false);
        }}
      />

      <ChatWindow
        selectedUser={selectedUser}
        onOpenSidebar={() => setSidebarOpen(true)}
      />
    </div>
  );
};

export default ChatLayout;