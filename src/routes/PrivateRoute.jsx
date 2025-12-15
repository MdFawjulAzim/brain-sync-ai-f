import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectToken } from "../store/features/auth/authSlice";

const PrivateRoute = () => {
    const token = useSelector(selectToken);

    return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;