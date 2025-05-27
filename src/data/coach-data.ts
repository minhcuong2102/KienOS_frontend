import { useState, useEffect } from "react";
import { GridRowsProp } from "@mui/x-data-grid";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { rootPaths } from "../routes/paths";
export const useCoachsData = () => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchCoachs = async () => {
      try {
        setLoading(true);
        const response = await axiosPrivate.get(rootPaths.root + "/api/v1/coach-profiles/", {
          withCredentials: true,
        });
        // Nếu backend có pagination thì response.data.results
        const formattedRows = response.data.map((coach) => ({
          id: coach.id,
          avatar: coach.avatar,
          email: coach.email,
          phone: coach.phone,
          average_rating: coach.average_rating,
          first_name: coach.first_name,
          last_name: coach.last_name,
          address: coach.address,
          gender: coach.gender,
          birthday: coach.birthday,
          height: coach.height,
          weight: coach.weight,
          start_date: coach.start_date,
          experiences: coach.experiences,
          contracts: coach.coach_contracts,
          
        }));

        setRows(formattedRows);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoachs();
  }, []);

  return { rows, loading, error };
};
