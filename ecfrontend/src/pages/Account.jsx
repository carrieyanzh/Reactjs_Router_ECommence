import { useSelector } from "react-redux";

function Account() {
  const user = useSelector((state) => state.auth.user);

  return (
    <div>
      <h2>Account Information</h2>

      <div className="account-details">
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        {/* <p><strong>User ID:</strong> {user?.id}</p> */}
      </div>
    </div>
  );
}

export default Account;