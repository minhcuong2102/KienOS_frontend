import { useState, useEffect } from 'react';
import { GridRowsProp } from '@mui/x-data-grid';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { rootPaths } from '../routes/paths';

export const useTrainingPlanData = (reloadTrigger: number, selectedValue: string) => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchTrainingPlans = async () => {
      try {
        setLoading(true);

        const url = selectedValue
          ? rootPaths.root + `/api/v1/training-plans/get-by-customers/?customer=${selectedValue}/`
          : rootPaths.root + `/api/v1/training-plans/get-by-customers/`;

        const response = await axiosPrivate.get(url, 
          {
            withCredentials: true,
          }
        ); 

        // Nếu backend có pagination thì response.data.results
        const formattedRows = response.data.training_plans.map((tp) => ({
          id: tp.id,
          note: tp.note,
          overview: tp.overview,
          estimated_duration: tp.estimated_duration,
          customer: tp.customer,
          exercises: tp.exercises,
          
        }));

        
        setRows(formattedRows);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainingPlans();

  }, [reloadTrigger]);

  return { rows, loading, error };
};
