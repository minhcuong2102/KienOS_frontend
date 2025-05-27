import { useMemo, useEffect, ReactElement, useState } from 'react';
import { usePTContractData } from '../../data/ptcontract-data';
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
import NotificationService from '../../services/notification';
import { rootPaths } from '../../routes/paths';

interface PTContractData {
  id: string;
  start_date: string;
  expire_date: string;
  ptservice_id: string;
  coach_name: string;
  customer_name: string;
  ptservice_name: string;
  used_session: string;
  number_of_session: string;
  is_purchased: boolean;
  coach_id: string;
  customer_id: string;
  real_customer_id: string;
  real_coach_id;
}

const SalePTContractTable = ({ searchText }: { searchText: string }): ReactElement => {
  const apiRef = useGridApiRef<GridApi>();
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const { rows, loading, error } = usePTContractData(reloadTrigger);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPTContract, setEditingPTContract] = useState<PTContractData | null>(null);
  const [isEditMode, setEditMode] = useState(!!editingPTContract);
  const [emailError, setEmailError] = useState('');
  const axiosPrivate = useAxiosPrivate();
  const [rowSelectionModel, setRowSelectionModel] = useState([]);
  const [coachNames, setCoachNames] = useState<{ id: string, name: string, coach_id: string }[]>([]);
  const [customerNames, setCustomerNames] = useState<{ id: string, name: string, customer_id: string }[]>([]);
  const [ptServices, setPtServices] = useState<{ id: string, name: string }[]>([]);

  useEffect(() => {
    const fetchCoachNames = async () => {
      try {
        const response = await axiosPrivate.get(rootPaths.root + '/nodejs/chat/getAllCoachProfiles');
        setCoachNames(response.data.map((coach: any) => ({ id: coach.id, name: `${coach.first_name} ${coach.last_name}`, coach_id: coach.coach_id })));
      } catch (error) {
        console.error('Error fetching coach names:', error);
      }
    };

    const fetchCustomerNames = async () => {
      try {
        const response = await axiosPrivate.get(rootPaths.root + '/nodejs/chat/getAllCustomerProfiles');
        setCustomerNames(response.data.map((customer: any) => ({ id: customer.id, name: `${customer.first_name} ${customer.last_name}`, customer_id: customer.customer_id })));
      } catch (error) {
        console.error('Error fetching customer names:', error);
      }
    };

    const fetchPtServices = async () => {
      try {
        const response = await axiosPrivate.get(rootPaths.root + '/nodejs/ptcontract/getPtServices');
        setPtServices(response.data.map((service: any) => ({ id: service.id, name: service.name })));
      } catch (error) {
        console.error('Error fetching PT services:', error);
      }
    };

    fetchCoachNames();
    fetchCustomerNames();
    fetchPtServices();
  }, [axiosPrivate]);

  const handleEdit = (id: string) => {
    setEditMode(true);
    const ptContract = rows.find(row => row.id === id);
    if (ptContract) {
      setEditingPTContract(ptContract);
      setEditModalOpen(true);
    }
  };

  const handleAdd = () => {
    setEditMode(false);
    setEditingPTContract({
      id: '',
      start_date: '',
      expire_date: '',
      ptservice_id: '',
      coach_name: '',
      customer_name: '',
      ptservice_name: '',
      used_session: '0',
      is_purchased: false,
      coach_id: '',
      customer_id: '',
    });
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingPTContract(null);
    setEmailError('');
  };

  const handleSave = async () => {
    setEmailError('');

    if (!editingPTContract) return;

    if (isEditMode) {
      await handleSaveEdit();
    } else {
      await handleSaveAdd();
    }
  };

    const handleSaveEdit = async () => {
    if (!editingPTContract) return;
    try {
      const response = await axiosPrivate.put(
        rootPaths.root + `/nodejs/ptcontract/updatePtContract/${editingPTContract.id}/`,
        {
          startDate: editingPTContract.start_date,
          expireDate: editingPTContract.expire_date,
          coachId: editingPTContract.coach_id,
          isPurchased: editingPTContract.is_purchased,
          usedSession: editingPTContract.used_session,
          numberOfSession: editingPTContract.number_of_session,
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
    if (!editingPTContract) return;
  
    try {
      const response = await axiosPrivate.post(
        rootPaths.root + `/nodejs/ptcontract/addPtContract/`,
        {
          startDate: editingPTContract.start_date,
          expireDate: editingPTContract.expire_date,
          //coachId: editingPTContract.coach_id,
          coachId: null,
          customerId: editingPTContract.customer_id,
          ptServiceId: editingPTContract.ptservice_id,
          isPurchased: editingPTContract.is_purchased,
          numberOfSession: editingPTContract.number_of_session,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (response.status >= 200 && response.status < 300) {
        // await NotificationService.createNotification(
        //   axiosPrivate,
        //   editingPTContract.real_customer_id,
        //   `Một hợp đồng mới đã được tạo dành cho bạn. Hãy vào danh sách hợp đồng để kiểm tra.
        //   Tên coach: ${editingPTContract.coach_name}, Tên khách: ${editingPTContract.customer_name},
        //   Tên gói: ${editingPTContract.ptservice_name}`,
        // );

        const customerData = {

          ...response?.data?.customer,
          ...response?.data?.customer?.customer,
          customer_user_id: response?.data?.customer?.customer_id,
          coachId: editingPTContract?.coach_id, //column id in coach_profile
          customer_contracts_pt: [{
            ...response?.data,
            ptservice: response?.data?.ptService,
            coachId: editingPTContract?.coach_id //column id in coach_profile
          }],
          workout_goal: response?.data?.customer?.workout_goal,
          id: response?.data?.customer?.id,

        };

        await NotificationService.createNotification(
          axiosPrivate,
          editingPTContract?.real_coach_id, //column coach_id in coach_profile
          `Lễ tân đã giao cho bạn hợp đồng với (${editingPTContract?.customer_name}). 
            Hãy kiểm tra lịch dạy để phản hồi sớm!`,
          customerData
        );
      }
      
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
        const response = await axiosPrivate.post(rootPaths.root + '/nodejs/ptcontract/deletePtContractMultiple', {
          ids: idsToDelete,
        });
        alert('Deleted successfully!');
        
        setReloadTrigger((prev) => prev + 1);
      } catch (error) {
        console.error("Error deleting pt contracts:", error);
        alert(error.response?.data?.error || "An error occurred while deleting pt contracts.");
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
      field: 'ptservice_name',
      headerName: 'Tên gói',
      resizable: false,
      flex: 0.5,
      minWidth: 150,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'coach_name',
      headerName: 'HLV',
      resizable: false,
      flex: 0.5,
      minWidth: 150,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const value = params?.value;
        const displayText = 'Chờ phản hồi 🕒⏳';
        const displayValue = (value === undefined || value === "undefined undefined") ?  displayText : value;
        const style = (displayValue === displayText) ? { color: 'lime' } : {};
        return <span style={style}>{displayValue}</span>;
      },
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
    // {
    //   field: 'used_session',
    //   headerName: 'Số buổi tập',
    //   resizable: false,
    //   flex: 0.5,
    //   minWidth: 150,
    //   headerAlign: 'center',
    //   align: 'center',
    // },
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
      flex: 0.5,
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
          {isEditMode ? 'Cập nhật hợp đồng HLV' : 'Tạo hợp đồng HLV'}
        </DialogTitle>
                <DialogContent>
          {editingPTContract && (
            <>
              {emailError && <Alert severity="error">{emailError}</Alert>}
        
              <TextField
                autoFocus
                margin="dense"
                label="Ngày bắt đầu"
                type="date"
                fullWidth
                variant="standard"
                value={editingPTContract.start_date}
                onChange={(e) => setEditingPTContract({ ...editingPTContract, start_date: e.target.value })}
                InputLabelProps={{
                  shrink: true,
                }}
              />
        
              <TextField
                margin="dense"
                label="Ngày kết thúc (tuỳ chọn)"
                type="date"
                fullWidth
                variant="standard"
                value={editingPTContract.expire_date}
                onChange={(e) => setEditingPTContract({ ...editingPTContract, expire_date: e.target.value })}
                InputLabelProps={{
                  shrink: true,
                }}
              />
        
              <FormControl fullWidth margin="dense">
                <InputLabel id="coach-name-label">Tên PT</InputLabel>
                <Select
                  labelId="coach-name-label"
                  id="coach-name-select"
                  value={editingPTContract.coach_name}
                  onChange={(e) => {
                    const selectedCoach = coachNames.find(coach => coach.name === e.target.value);
                    setEditingPTContract({ 
                      ...editingPTContract, 
                      coach_name: e.target.value,
                      coach_id: selectedCoach ? selectedCoach.id : '',
                      real_coach_id: selectedCoach ? selectedCoach?.coach_id : '',
                    });
                  }}
                >
                  {coachNames.map((coach) => (
                    <MenuItem key={coach.id} value={coach.name}>
                      {coach.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
        
              <FormControl fullWidth margin="dense">
                <InputLabel id="customer-name-label">Tên khách hàng</InputLabel>
                <Select
                  labelId="customer-name-label"
                  id="customer-name-select"
                  value={editingPTContract.customer_name}
                  onChange={(e) => {
                    const selectedCustomer = customerNames.find(customer => customer.name === e.target.value);
                    setEditingPTContract({ 
                      ...editingPTContract, 
                      customer_name: e.target.value,
                      customer_id: selectedCustomer ? selectedCustomer.id : '',
                      real_customer_id: selectedCustomer ? selectedCustomer?.customer_id : '',
                    });
                  }}
                  disabled={isEditMode}
                >
                  {customerNames.map((customer) => (
                    <MenuItem key={customer.id} value={customer.name}>
                      {customer.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
        
              <FormControl fullWidth margin="dense">
                <InputLabel id="ptservice-name-label">Tên gói</InputLabel>
                <Select
                  labelId="ptservice-name-label"
                  id="ptservice-name-select"
                  value={editingPTContract.ptservice_name}
                  onChange={(e) => {
                    const selectedService = ptServices.find(service => service.name === e.target.value);
                    setEditingPTContract({ 
                      ...editingPTContract, 
                      ptservice_name: e.target.value,
                      ptservice_id: selectedService ? selectedService.id : ''
                    });
                  }}
                  disabled={isEditMode}
                >
                  {ptServices.map((service) => (
                    <MenuItem key={service.id} value={service.name}>
                      {service.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
        
              <TextField
                margin="dense"
                label="Số buổi tập đã dùng" 
                type="text"
                fullWidth
                variant="standard"
                value={editingPTContract?.used_session?.includes('/') ? editingPTContract?.used_session?.split('/')[0] : editingPTContract?.used_session}
                onChange={(e) => setEditingPTContract({ ...editingPTContract, used_session: e.target.value })}
              />
        
              <TextField
                margin="dense"
                label="Tổng buổi tập" 
                type="text"
                fullWidth
                variant="standard"
                value={editingPTContract.number_of_session}
                onChange={(e) => setEditingPTContract({ ...editingPTContract, number_of_session: e.target.value })}
              />
        
              <FormControl fullWidth margin="dense">
                <InputLabel id="is-purchased-label">Thanh toán</InputLabel>
                <Select
                  labelId="is-purchased-label"
                  id="is-purchased-select"
                  value={editingPTContract.is_purchased}
                  onChange={(e) => setEditingPTContract({ ...editingPTContract, is_purchased: e.target.value === 'true' })}
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

export default SalePTContractTable;