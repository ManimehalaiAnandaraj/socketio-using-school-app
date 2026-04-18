import React from "react";
import { useGetUsersQuery } from "../../redux/userApi";
import { useSelector } from "react-redux";

const ChatSidebar = ({ onSelectUser }) => {
  const { data: users = [] } = useGetUsersQuery();
  const currentUser = useSelector((state) => state.auth.user);

  return (
    <div>
       <h2>
        Chat Page
      </h2>
    <div className="chat-sidebar">
      <h3> {currentUser?.name}</h3>

      {users
        .filter((u) => u._id !== currentUser._id)
        .map((user) => (
          <div
            key={user._id}
            className="chatsidebar-user"
            onClick={() => onSelectUser(user)}
          >
            <div className="avatar">{user.name[0]}</div>
            <div>
              <div className="name">{user.name}</div>
              <div className="last-msg">Click to chat</div>
            </div>
          </div>
        ))}
    </div>
    </div>
  );
};

export default ChatSidebar;