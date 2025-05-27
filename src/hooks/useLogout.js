import useAxiosPrivate from "./useAxiosPrivate";
import { rootPaths } from "../routes/paths";

const useLogout = () => {
    const axiosPrivate = useAxiosPrivate();

    const logout = async () => {
        localStorage.removeItem('persist');
        try {
            axiosPrivate.post(rootPaths.root + '/api/v1/users/log-out/', 
            {}, 
            {
                withCredentials: true
            });            

        } catch (err) {
            console.error(err);
        }
        
    }

    return logout;
}

export default useLogout