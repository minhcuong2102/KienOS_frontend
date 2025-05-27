import { useState, useEffect } from 'react';
import { GridRowsProp } from '@mui/x-data-grid';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { rootPaths } from '../routes/paths';

export const useNonPTContractData = (reloadTrigger: number) => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchNonPTContracts = async () => {
      try {
        setLoading(true);
        console.log("callleddd")
        const response = await axiosPrivate.get(rootPaths.root + '/nodejs/ptcontract/getAllContractsNonPT_ForFE/', 
          {
            withCredentials: true,
          }
        ); 
        console.log(response)

        // Nếu backend có pagination thì response.data.results
        const formattedRows = response.data.map((contract) => ({
          id: contract?.id,
          start_date: contract?.start_date,
          expire_date: contract?.expire_date,
          nonptservice_id: contract?.nonptservice_id,
          customer_name: contract?.customer?.first_name + " " + contract?.customer?.last_name,
          nonptservice_name: contract?.nonPtService?.name,
          is_purchased: contract?.is_purchased,
          customer_id: contract?.customer.id,
        }));

        
        setRows(formattedRows);
        console.log(formattedRows)
        console.log("====================================")
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNonPTContracts();

  }, [reloadTrigger]);

  return { rows, loading, error };
  //return { rowsX: rows };
};
