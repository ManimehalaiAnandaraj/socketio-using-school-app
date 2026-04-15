const RoleRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return <h2>Please Login</h2>;

  if (!allowedRoles.includes(user.role)) {
    return <h2
        style={{
          color: "blue",
          fontWeight: 700,
          marginBottom: "10px",
          fontSize: "20px",
        }}
      >
        Access Denied
      </h2>
  }

  return children;
};

export default RoleRoute;