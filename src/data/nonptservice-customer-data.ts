import { useState, useEffect } from 'react';
import { GridRowsProp } from '@mui/x-data-grid';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { rootPaths } from '../routes/paths';

export const useNonPTServiceCustomerData = (reloadTrigger: number, selectedValue: string) => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchNonPTServiceCustomers = async () => {
      try {
        setLoading(true);

        const url = selectedValue
          ? rootPaths.root + `/api/v1/nonpt-services/customers/?nonpt_service=${selectedValue}`
          : rootPaths.root + `/api/v1/nonpt-services/customers/`;


        const response = await axiosPrivate.get(url, 
          {
            withCredentials: true,
          }
        ); 

        // Nếu backend có pagination thì response.data.results
        const formattedRows = response.data.map((npsc) => ({
          id: npsc.id,
          first_name: npsc.first_name,
          last_name: npsc.last_name,
          address: npsc.address,
          gender: npsc.gender,
          birthday: npsc.birthday,
          email: npsc.email,
          phone: npsc.phone,
          avatar: npsc.avatar,
          height: npsc.height,
          weight: npsc.weight,
          health_condition: npsc.health_condition,
          workout_goal: npsc.workout_goal,
          contracts: npsc.customer_contracts,
        }));

        
        setRows(formattedRows);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNonPTServiceCustomers();

  }, [reloadTrigger, selectedValue]);

  return { rows, loading, error };
};
