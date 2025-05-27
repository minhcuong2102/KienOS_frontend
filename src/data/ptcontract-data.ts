import { useState, useEffect } from 'react';
import { GridRowsProp } from '@mui/x-data-grid';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { rootPaths } from '../routes/paths';

export const usePTContractData = (reloadTrigger: number) => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchPTContracts = async () => {
      try {
        setLoading(true);
        const response = await axiosPrivate.get(rootPaths.root + '/nodejs/ptcontract/getAllContractsPT_ForFE/', 
          {
            withCredentials: true,
          }
        ); 
        // console.log("getAllContractsPT_ForFE:")
        // console.log(response)
        // Nếu backend có pagination thì response.data.results
        const formattedRows = response.data.map((contract) => ({
          id: contract?.id,
          start_date: contract?.start_date,
          expire_date: contract?.expire_date,
          ptservice_id: contract?.ptservice_id,
          coach_name: contract?.coach?.first_name + " " + contract?.coach?.last_name,
          customer_name: contract?.customer?.first_name + " " + contract?.customer?.last_name,
          ptservice_name: contract?.ptService?.name,
          used_session: contract?.used_sessions + "/" + contract?.number_of_session,
          number_of_session: contract?.number_of_session,
          is_purchased: contract?.is_purchased,
          coach_id: contract?.coach?.id,
          customer_id: contract?.customer?.id,

          coach: contract?.coach,
          customer: contract?.customer,
          pt_service: contract?.ptService,
        }));
        
        setRows(formattedRows);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPTContracts();

  }, [reloadTrigger]);

  return { rows, loading, error };
  //return { rowsX: rows };
};
