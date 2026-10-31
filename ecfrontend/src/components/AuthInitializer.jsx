import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchCurrentUser } from "../features/auth/authSlice";

function AuthInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return children;
}

export default AuthInitializer;