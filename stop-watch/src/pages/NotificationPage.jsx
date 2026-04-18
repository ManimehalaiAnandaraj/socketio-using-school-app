import React from "react";
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
} from "../redux/userApi";

const NotificationPage = () => {
  const { data: notifications = [], isLoading } =
    useGetNotificationsQuery();

  const [markRead] = useMarkNotificationReadMutation();

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="notification-page">
      <h2>All Notifications</h2>

      {notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        notifications.map((n) => (
          <div
            key={n._id}
            className={`notification-card ${
              n.isRead ? "read" : "unread"
            }`}
          >
            <p>
              <strong>{n.sender?.name}</strong> sent you a message
            </p>

            <small>
              {new Date(n.createdAt).toLocaleString()}
            </small>

            {!n.isRead && (
              <button onClick={() => markRead(n._id)}>
                Mark as read
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default NotificationPage;