import { useState, useEffect } from "react";
import { GridRowsProp } from "@mui/x-data-grid";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { rootPaths } from "../routes/paths";

export const useUsersData = (reloadTrigger: number) => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axiosPrivate.get(rootPaths.root + "/api/v1/users/", {
          withCredentials: true,
        });
        console.log(response.data);
        // Nếu backend có pagination thì response.data.results
        const formattedRows = response.data.map((user) => ({
          id: user.id,
          email: user.email,
          status: user.status,
          avatar_url: user.avatar_url,
          email_verified: user.email_verified,
          role: user.role.name,
        }));

        setRows(formattedRows);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [reloadTrigger]);

  return { rows, loading, error };
};
