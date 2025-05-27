import { useState, useEffect } from 'react';
import { GridRowsProp } from '@mui/x-data-grid';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { rootPaths } from '../routes/paths';

export const usePTServicesData = (reloadTrigger: number) => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchPTServices = async () => {
      try {
        setLoading(true);
        const response = await axiosPrivate.get(rootPaths.root + '/api/v1/pt-services/', 
          {
            withCredentials: true,
          }
        ); 

        // Nếu backend có pagination thì response.data.results
        const formattedRows = response.data.map((ptservice) => ({
          id: ptservice.id,
          discount: ptservice.discount,
          discount_start: ptservice.discount_start
            ? ptservice.discount_start.substring(0, 10) 
            : null,
          discount_end: ptservice.discount_end
            ? ptservice.discount_end.substring(0, 10)
            : null,
          session_duration: ptservice.session_duration, 
          cost_per_session: ptservice.cost_per_session, 
          validity_period: ptservice.validity_period, 
          name: ptservice.name, 
          details: ptservice.details,
        }));

        
        setRows(formattedRows);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPTServices();

  }, [reloadTrigger]);

  return { rows, loading, error };
};
