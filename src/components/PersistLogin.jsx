import { useState, useEffect } from "react";
import useRefreshToken from '../hooks/useRefreshToken';
import useAuth from "../hooks/useAuth";
import { CircularProgress } from "@mui/material";
import Cookies from "js-cookie";

const PersistLogin = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const refresh = useRefreshToken();
    const { auth, persist } = useAuth();
    
    useEffect(() => {
        let isMounted = true;

        const verifyRefreshToken = async () => {
            try {
                await refresh();
            }
            catch (err) {
                console.error(err);
                const alertShown = Cookies.get("alertShown");
                console.log(alertShown);
                if (!alertShown) {
                    alert("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
                    Cookies.set("alertShown", "true", { path: "/", expires: 1 });
                }
            }
            finally {
                isMounted && setIsLoading(false);
            }
        }

        !auth?.accessToken && persist ? verifyRefreshToken() : setIsLoading(false);

        return () => isMounted = false;
    }, [auth, persist, refresh]); 

    useEffect(() => {
        if (auth?.accessToken) {
            Cookies.remove("alertShown");
        }
    }, [auth]);

    return (
        <>
            {!persist
                ? children 
                : isLoading
                    ? (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100vh',
                        }}>
                            <CircularProgress />
                        </div>
                    )
                    : children
            }
        </>
    );
}

export default PersistLogin;
