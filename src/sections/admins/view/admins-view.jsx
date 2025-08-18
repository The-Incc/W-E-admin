/* eslint-disable */
import { useState, useEffect, useContext } from 'react';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import { Alert } from '@mui/material';

import Scrollbar from 'src/components/scrollbar';
import UserTableHead from 'src/sections/user/user-table-head';
import UserTableRow from 'src/sections/user/user-table-row';
import UserTableToolbar from 'src/sections/user/user-table-toolbar';
import TableEmptyRows from 'src/sections/user/table-empty-rows';
import TableNoData from 'src/sections/user/table-no-data';
import { emptyRows, applyFilter, getComparator } from 'src/sections/user/utils';
import axiosInstance from 'src/api/axiosInstance';
import AuthContext from 'src/context/AuthContext';

export default function AdminsView() {
  const { token } = useContext(AuthContext);
  const [admins, setAdmins] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('fullName');
  const [selected, setSelected] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formImage, setFormImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [severity, setSeverity] = useState('success');

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await axiosInstance.get('/user/admins');
        setAdmins(res.data.admins || res.data);
      } catch (e) {
        console.error('Error fetching admins', e);
      }
    };
    fetchAdmins();
  }, []);

  const handleOpenModal = () => {
    setEditingAdmin(null);
    setFormFullName('');
    setFormEmail('');
    setFormPhone('');
    setFormPassword('');
    setFormImage(null); setImagePreview(null); setErrors({});
    setOpenModal(true);
  };

  const handleEditAdmin = (admin) => {
    setEditingAdmin(admin);
    setFormFullName(admin.fullName || '');
    setFormEmail(admin.email || '');
    setFormPhone(admin.phone || '');
    setFormPassword('');
    setFormImage(null); setImagePreview(admin.profileImage || null); setErrors({});
    setOpenModal(true);
  };

  const validate = () => {
    const e = {};
    if (!formFullName || formFullName.length > 100) e.fullName = 'Full name is required (max 100 chars)';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formEmail || !emailRegex.test(formEmail)) e.email = 'Valid email is required';
    const phoneRegex = /^\d{10,15}$/;
    if (!formPhone || !phoneRegex.test(formPhone)) e.phone = 'Phone must be 10-15 digits';
    if (!editingAdmin) {
      const complexity = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
      if (!formPassword || !complexity.test(formPassword)) e.password = 'Password must be 8+ with upper, lower, number, special';
    }
    if (formImage) {
      const isValidType = /image\/(jpeg|png)/.test(formImage.type);
      const isValidSize = formImage.size <= 2 * 1024 * 1024;
      if (!isValidType) e.image = 'Only JPG/PNG allowed';
      if (!isValidSize) e.image = 'Max size 2MB';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setFormImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (editingAdmin) {
        const res = await axiosInstance.put(`/user/user/${editingAdmin.id}`, { 
          fullName: formFullName, 
          email: formEmail, 
          phone: formPhone 
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 200) {
          setSnackbarMessage('Admin updated successfully!');
          setSeverity('success');
          setSnackBarOpen(true);
          const updated = res.data.user || res.data;
          setAdmins(prev => prev.map(a => (a.id === editingAdmin.id ? updated : a)));
          setOpenModal(false);
        }
      } else {
        const fd = new FormData();
        fd.append('fullName', formFullName);
        fd.append('email', formEmail);
        fd.append('phone', formPhone);
        fd.append('password', formPassword);
        if (formImage) fd.append('file', formImage);
        const res = await axiosInstance.post('/user/createAdminUser', fd, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        if (res.status === 201) {
          setSnackbarMessage('Admin created successfully!');
          setSeverity('success');
          setSnackBarOpen(true);
          const newAdmin = res.data.user || res.data;
          setAdmins(prev => [ ...prev, newAdmin]);
          setOpenModal(false);
        }
      }
    } catch (err) {
      setSnackbarMessage('Operation failed. Please try again.');
      setSeverity('error');
      setSnackBarOpen(true);
    }
  };

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = admins.map((n) => n.fullName);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => { setPage(0); setRowsPerPage(parseInt(event.target.value, 10)); };
  const handleFilterByName = (event) => { setPage(0); setFilterName(event.target.value); };

  const dataFiltered = applyFilter({ inputData: admins, comparator: getComparator(order, orderBy), filterName });
  const notFound = !dataFiltered.length && !!filterName;

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Admins</Typography>
        <Button variant="contained" color="inherit" onClick={handleOpenModal}>New Admin</Button>
      </Stack>
      <Card>
        <UserTableToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} />
        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={order}
                orderBy={orderBy}
                rowCount={admins.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={[
                  { id: 'fullName', label: 'Name' },
                  { id: 'company', label: 'Email' },
                  { id: 'role', label: 'Role' },
                  { id: 'isVerified', label: 'Phone Number', align: 'center' },
                  { id: 'status', label: 'Status' },
                  { id: 'actions', label: 'Actions' },
                  { id: '' },
                ]}
              />
              <TableBody>
                {dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                  <UserTableRow
                    key={row?.id}
                    id={row?.id}
                    name={row?.fullName}
                    company={row?.email}
                    role={row?.role}
                    status={row?.status}
                    avatarUrl={row.profileImage && row.profileImage}
                    isVerified={row?.phone}
                    selected={selected.indexOf(row?.fullName) !== -1}
                    handleClick={(event) => handleClick(event, row?.fullName)}
                    onEdit={handleEditAdmin}
                    onDeleted={(deletedId)=> setAdmins(prev => prev.filter(a => a.id !== deletedId))}
                  />
                ))}
                <TableEmptyRows height={77} emptyRows={emptyRows(page, rowsPerPage, admins.length)} />
                {notFound && <TableNoData query={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
        <TablePagination page={page} component="div" count={admins.length} rowsPerPage={rowsPerPage} onPageChange={handleChangePage} rowsPerPageOptions={[5,10,25]} onRowsPerPageChange={handleChangeRowsPerPage} />
      </Card>
      <Modal open={openModal} onClose={()=>setOpenModal(false)}>
        <Box sx={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', bgcolor:'background.paper', p:3, width:600, borderRadius:2 }}>
          <Typography>{editingAdmin ? 'Edit Admin' : 'Add New Admin'}</Typography>
          <Stack spacing={2} mt={2}>
            <TextField 
              label="Full Name" 
              value={formFullName} 
              onChange={(e)=>setFormFullName(e.target.value)} 
              error={!!errors.fullName} 
              helperText={errors.fullName} 
            />
            <TextField label="Email" type="email" value={formEmail} onChange={(e)=>setFormEmail(e.target.value)} error={!!errors.email} helperText={errors.email} />
            <TextField label="Phone" value={formPhone} onChange={(e)=>setFormPhone(e.target.value)} error={!!errors.phone} helperText={errors.phone} />
            {!editingAdmin && <TextField label="Password" type="password" value={formPassword} onChange={(e)=>setFormPassword(e.target.value)} error={!!errors.password} helperText={errors.password} />}
            {!editingAdmin && (
              <>
                {imagePreview && (
                  <Box sx={{ display:'flex', alignItems:'center', gap:2, p:1, border:'1px dashed', borderColor:'divider', borderRadius:1, bgcolor:'background.default' }}>
                    <Box component="img" src={imagePreview} alt="Preview" sx={{ height: 120, width: 160, objectFit:'cover', borderRadius:1, border:'1px solid', borderColor:'divider' }} />
                  </Box>
                )}
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button variant="contained" component="label" color="inherit">
                    Upload Image
                    <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                  </Button>
                  {errors.image && <Typography variant="caption" color="error">{errors.image}</Typography>}
                </Stack>
              </>
            )}
            <Stack direction="row" spacing={2} justifyContent={'flex-end'}>
              <Button variant="outlined" color="inherit" onClick={()=>setOpenModal(false)}>Cancel</Button>
              <Button variant="contained" color="primary" onClick={handleSubmit}>{editingAdmin ? 'Save' : 'Create'}</Button>
            </Stack>
          </Stack>
        </Box>
      </Modal>
      <Snackbar open={snackBarOpen} autoHideDuration={6000} onClose={()=>setSnackBarOpen(false)}>
        <Alert onClose={()=>setSnackBarOpen(false)} severity={severity} variant="filled" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

