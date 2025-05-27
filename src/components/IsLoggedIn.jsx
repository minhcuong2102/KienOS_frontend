import { Navigate } from "react-router-dom";

const IsLoggedIn = ({ children }) => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (isLoggedIn) {
        return <Navigate to={"/"} replace />;
    }

    return children;
}

export default IsLoggedIn;
