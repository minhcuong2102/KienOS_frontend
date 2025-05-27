import { useMemo, useEffect, ReactElement, useState } from 'react';
import { useNonPTContractData } from '../../data/nonptcontract-data';
import IconifyIcon from '../base/IconifyIcon';
import React from 'react';
import CustomPagination from '../common/CustomPagination';
import CustomNoResultsOverlay from '../common/CustomNoResultsOverlay';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { 
  Stack, 
  Tooltip, 
  Typography, 
  CircularProgress,
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField,
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Grid,
  Alert,
  InputAdornment,
} from '@mui/material';

import {
  GridApi,
  DataGrid,
  GridSlots,
  GridColDef,
  useGridApiRef,
  GridActionsCellItem,
  GridRenderCellParams,
  GridTreeNodeWithRender,
} from '@mui/x-data-grid';
import { rootPaths } from '../../routes/paths';
interface NonPTContractData {
  id: string;
  start_date: string;
  duration: number;
  expire_date?: string;
  nonptservice_id: string;
  customer_name: string;
  nonptservice_name: string;
  is_purchased: boolean;
  customer_id: string;
}

const SaleNonPTContractTable = ({ searchText }: { searchText: string }): ReactElement => {
  const apiRef = useGridApiRef<GridApi>();
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const { rows, loading, error } = useNonPTContractData(reloadTrigger);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingNonPTContract, setEditingNonPTContract] = useState<NonPTContractData | null>(null);
  const [isEditMode, setEditMode] = useState(!!editingNonPTContract);
  const [emailError, setEmailError] = useState('');
  const axiosPrivate = useAxiosPrivate();
  const [rowSelectionModel, setRowSelectionModel] = useState([]);
  const [customerNames, setCustomerNames] = useState<{ id: string, name: string }[]>([]);
  const [nonPtServices, setNonPtServices] = useState<{ id: string, name: string }[]>([]);

  useEffect(() => {
    const fetchCustomerNames = async () => {
      try {
        const response = await axiosPrivate.get(rootPaths.root + 'nodejs/chat/getAllCustomerProfiles');
        setCustomerNames(response.data.map((customer: any) => ({ id: customer.id, name: `${customer.first_name} ${customer.last_name}` })));
      } catch (error) {
        console.error('Error fetching customer names:', error);
      }
    };

    const fetchNonPtServices = async () => {
      try {
        const response = await axiosPrivate.get(rootPaths.root + '/nodejs/non-ptcontract/getNonPtServices');
        setNonPtServices(response.data.map((service: any) => ({ id: service.id, name: service.name })));
      } catch (error) {
        console.error('Error fetching non-pt services:', error);
      }
    };

    fetchCustomerNames();
    fetchNonPtServices();
  }, [axiosPrivate]);

  const handleEdit = (id: string) => {
    setEditMode(true);
    const nonPTContract = rows.find(row => row.id === id);
    if (nonPTContract) {
      setEditingNonPTContract(nonPTContract);
      setEditModalOpen(true);
    }
  };

  const handleAdd = () => {
    setEditMode(false);
    setEditingNonPTContract({
      id: '',
      start_date: '',
      duration: 1,
      nonptservice_id: '',
      customer_name: '',
      nonptservice_name: '',
      is_purchased: false,
      customer_id: '',
    });
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingNonPTContract(null);
    setEmailError('');
  };

  const handleSave = async () => {
    setEmailError('');

    if (!editingNonPTContract) return;

    if (isEditMode) {
      await handleSaveEdit();
    } else {
      await handleSaveAdd();
    }
  };

  const handleSaveEdit = async () => {
    if (!editingNonPTContract) return;
    try {
      const response = await axiosPrivate.put(
        rootPaths.root + `/nodejs/non-ptcontract/updateNonPTContract/${editingNonPTContract.id}/`,
        {
          startDate: editingNonPTContract.start_date,
          expireDate: editingNonPTContract.expire_date,
          isPurchased: editingNonPTContract.is_purchased,
          customerId: editingNonPTContract.customer_id,
          nonPtServiceId: editingNonPTContract.nonptservice_id,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      setReloadTrigger(prev => prev + 1);
      handleCloseEditModal();
    } catch (error) {
      if (error) {
        setEmailError('An error occurred while updating the contract!');
        return;
      }
    }
  };

  const handleSaveAdd = async () => {
    if (!editingNonPTContract) return;

    try {
      const response = await axiosPrivate.post(
        rootPaths.root + `/nodejs/non-ptcontract/addNonPTContract/`,
        {
          startDate: editingNonPTContract.start_date,
          duration: editingNonPTContract.duration,
          customerId: editingNonPTContract.customer_id,
          isPurchased: editingNonPTContract.is_purchased,
          nonPtServiceId: editingNonPTContract.nonptservice_id,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('Added new Non-PT contract:', editingNonPTContract);
      setReloadTrigger(prev => prev + 1);
      handleCloseEditModal();
    } catch (error) {
      if (error) {
        if(error?.response?.data?.error){
          setEmailError(error?.response?.data?.error);
        }else{
          setEmailError('An error occurred while adding the contract!');
        } 
        return;
      }
    }
  };

  const handleDelete = async (id: string) => {
    const idsToDelete = rowSelectionModel.length > 0 ? rowSelectionModel : [id];
    console.log(idsToDelete);

    if (
      idsToDelete.length > 0 &&
      window.confirm("Are you sure you want to delete these contracts?")
    ) {
      try {
        const response = await axiosPrivate.post(rootPaths.root + '/nodejs/non-ptcontract/deleteNonPTContractMultiple', {
          ids: idsToDelete,
        });
        alert('Deleted successfully!');
        
        setReloadTrigger((prev) => prev + 1);
      } catch (error) {
        console.error("Error deleting non-pt contracts:", error);
        alert(error.response?.data?.error || "An error occurred while deleting non-pt contracts.");
      }
    }
  };

  const columns: GridColDef<any>[] = [
    {
      field: 'start_date',
      headerName: 'Ngày bắt đầu',
      resizable: false,
      flex: 0.5,
      minWidth: 150,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'nonptservice_name',
      headerName: 'Tên gói',
      resizable: false,
      flex: 0.5,
      minWidth: 150,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'customer_name',
      headerName: 'Khách hàng',
      resizable: false,
      flex: 0.5,
      minWidth: 150,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'is_purchased',
      headerName: 'Tình trạng thanh toán',
      resizable: false,
      flex: 0.5,
      minWidth: 150,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (params.value ? '✅' : '❌'),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Thao tác',
      resizable: false,
      flex: 1,
      minWidth: 80,
      getActions: (params) => {
        return [
          <Tooltip title="Edit">
            <GridActionsCellItem
              icon={
                <IconifyIcon
                  icon="fluent:edit-32-filled"
                  color="text.secondary"
                  sx={{ fontSize: 'body1.fontSize', pointerEvents: 'none' }}
                />
              }
              label="Edit"
              size="small"
              onClick={() => handleEdit(params.id)}
            />
          </Tooltip>,
          <Tooltip title="Delete">
            <GridActionsCellItem
              icon={
                <IconifyIcon
                  icon="mingcute:delete-3-fill"
                  color="error.main"
                  sx={{ fontSize: 'body1.fontSize', pointerEvents: 'none' }}
                />
              }
              label="Delete"
              size="small"
              onClick={() => handleDelete(params.id)}
            />
          </Tooltip>,
        ];
      },
    },
  ];

  const visibleColumns = useMemo(
    () => columns.filter((column) => column.field !== 'id'),
    [columns],
  );

  useEffect(() => {
    apiRef.current.setQuickFilterValues(
      searchText.split(/\b\W+\b/).filter((word: string) => word !== ''),
    );
  }, [searchText]);

  useEffect(() => {
    const handleResize = () => {
      if (apiRef.current) {
        apiRef.current.resize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [apiRef]);

  return (
    <>
      <DataGrid
        apiRef={apiRef}
        density="standard"
        columns={visibleColumns}
        autoHeight={false}
        rowHeight={56}
        checkboxSelection
        disableColumnMenu
        disableRowSelectionOnClick
        rows={rows}
        loading={loading}
        onRowSelectionModelChange={(newRowSelectionModel) => {
          setRowSelectionModel(newRowSelectionModel);
        }}
        rowSelectionModel={rowSelectionModel}
        onResize={() => {
          apiRef.current.autosizeColumns({
            includeOutliers: true,
            expand: true,
          });
        }}
        initialState={{
          pagination: { paginationModel: { page: 0, pageSize: 7 } },
        }}
        slots={{
          loadingOverlay: CircularProgress as GridSlots['loadingOverlay'],
          pagination: CustomPagination as GridSlots['pagination'],
          noResultsOverlay: CustomNoResultsOverlay as GridSlots['noResultsOverlay'],
        }}
        slotProps={{
          pagination: { labelRowsPerPage: rows.length },
        }}
        sx={{
          height: 1,
          width: 1,
          tableLayout: 'fixed',
          scrollbarWidth: 'thin',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
        <Button 
          onClick={handleAdd}
          sx={{ 
            width: '40px', 
            height: '40px', 
            fontSize: '20px', 
            padding: '0px 0px', 
          }}>+</Button>
      </div>
      <Dialog 
        open={editModalOpen} 
        onClose={handleCloseEditModal} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          style: {
            borderRadius: 10, 
            padding: '30px', 
          },
        }}
      >
        <DialogTitle sx={{ textAlign: 'center' }}>        
          {isEditMode ? 'Cập nhật hợp đồng gói tháng' : 'Tạo hợp đồng gói tháng'}
        </DialogTitle>
        <DialogContent>
          {editingNonPTContract && (
            <>
              {emailError && <Alert severity="error">{emailError}</Alert>}

              <TextField
                autoFocus
                margin="dense"
                label="Ngày bắt đầu"
                type="date"
                fullWidth
                variant="standard"
                value={editingNonPTContract.start_date}
                onChange={(e) => setEditingNonPTContract({ ...editingNonPTContract, start_date: e.target.value })}
                InputLabelProps={{
                  shrink: true,
                }}
              />

              {isEditMode ? (
                <TextField
                  margin="dense"
                  label="Ngày hết hạn"
                  type="date"
                  fullWidth
                  variant="standard"
                  value={editingNonPTContract.expire_date || ''}
                  onChange={(e) => setEditingNonPTContract({ ...editingNonPTContract, expire_date: e.target.value })}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              ) : (
                <FormControl fullWidth margin="dense">
                  <InputLabel id="duration-label">Thời gian (tháng)</InputLabel>
                  <Select
                    labelId="duration-label"
                    id="duration-select"
                    value={editingNonPTContract.duration}
                    onChange={(e) => setEditingNonPTContract({ ...editingNonPTContract, duration: parseInt(e.target.value) })}
                  >
                    {[...Array(12).keys()].map((month) => (
                      <MenuItem key={month + 1} value={month + 1}>
                        {month + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <FormControl fullWidth margin="dense">
                <InputLabel id="non-pt-service-label">Tên gói tháng</InputLabel>
                <Select
                  labelId="non-pt-service-label"
                  id="non-pt-service-select"
                  value={editingNonPTContract.nonptservice_id}
                  onChange={(e) => setEditingNonPTContract({ ...editingNonPTContract, nonptservice_id: e.target.value })}
                >
                  {nonPtServices.map((service) => (
                    <MenuItem key={service.id} value={service.id}>
                      {service.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="dense">
                <InputLabel id="customer-label">Khách hàng</InputLabel>
                <Select
                  labelId="customer-label"
                  id="customer-select"
                  value={editingNonPTContract.customer_id}
                  onChange={(e) => setEditingNonPTContract({ ...editingNonPTContract, customer_id: e.target.value })}
                >
                  {customerNames.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="dense">
                <InputLabel id="is-purchased-label">Thanh toán</InputLabel>
                <Select
                  labelId="is-purchased-label"
                  id="is-purchased-select"
                  value={editingNonPTContract.is_purchased}
                  onChange={(e) => setEditingNonPTContract({ ...editingNonPTContract, is_purchased: e.target.value === 'true' })}
                >
                  <MenuItem value="true">✅</MenuItem>
                  <MenuItem value="false">❌</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal} 
            color='error' 
            variant='contained'
            sx={{ 
              width: '100px',
              height: '50px', 
              fontSize: '16px', 
              padding: '10px 20px', 
            }}>Hủy</Button>
          
          <Button onClick={handleSave}
            sx={{ 
              width: '150px', 
              height: '50px', 
              fontSize: '16px', 
              padding: '10px 20px', 
              color: 'white',
              backgroundColor: '#4caf50',
              '&:hover': {
                    backgroundColor: '#388e3c',
                  },
            }}>        
            {isEditMode ? 'Lưu' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SaleNonPTContractTable;