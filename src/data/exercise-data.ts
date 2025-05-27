import { useState, useEffect } from 'react';
import { GridRowsProp } from '@mui/x-data-grid';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { rootPaths } from '../routes/paths';

export const useExercisesData = (reloadTrigger: number) => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        const response = await axiosPrivate.get(rootPaths.root + '/api/v1/exercises/', 
          {
            withCredentials: true,
          }
        ); 

        // Nếu backend có pagination thì response.data.results
        const formattedRows = response.data.map((exercise) => ({
          id: exercise.id,
          name: exercise.name,
          duration: exercise.duration,
          repetitions: exercise.repetitions,
          image_url: exercise.image_url,
          image_preview: exercise?.image_url ?? "",
          rest_period: exercise.rest_period,
          embedded_video_url: exercise.embedded_video_url,
          categories: exercise.categories.map((category) => ({
            id: category.id,
            name: category.name,
          })),
        }));

        
        setRows(formattedRows);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();

  }, [reloadTrigger]);

  return { rows, loading, error };
};
