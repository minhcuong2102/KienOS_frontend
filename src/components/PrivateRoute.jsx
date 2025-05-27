import { useLocation, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const PrivateRoute = ({ allowedRoles, children }) => {
    const { auth } = useAuth();
    const location = useLocation();
    
    if (!auth?.role) {
        return <Navigate to="/unauthorized" state={{ from: location }} replace />; 
    }

    if (auth?.status !== 1) {
        return <Navigate to="/banned" state={{ from: location }} replace />;
    }
    
    if (allowedRoles?.includes(auth?.role)) {
        return children; 
    } else {
        return <Navigate to="/forbidden" state={{ from: location }} replace />; 
    }
}

export default PrivateRoute;
