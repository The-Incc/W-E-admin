/* eslint-disable */

import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import Snackbar from '@mui/material/Snackbar';
import { Alert } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

// import { users } from 'src/_mock/user';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import TableNoData from '../table-no-data';
import UserTableRow from '../user-table-row';
import UserTableHead from '../user-table-head';
import TableEmptyRows from '../table-empty-rows';
import UserTableToolbar from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';
import axiosInstance from 'src/api/axiosInstance';
import { useContext } from 'react';
import AuthContext from 'src/context/AuthContext';
// ----------------------------------------------------------------------

function convertToCsvValue(value) {
  const stringValue = value === undefined || value === null ? '' : String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return '"' + stringValue.replace(/"/g, '""') + '"';
  }
  return stringValue;
}

function exportUsersToCSV(users) {
  const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Role', 'Status'];
  const rows = users.map((u) => [
    convertToCsvValue(u.id),
    convertToCsvValue(u.fullName),
    convertToCsvValue(u.email),
    convertToCsvValue(u.phone),
    convertToCsvValue(u.role),
    convertToCsvValue(u.status),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'users.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function UserPage() {
  const [open, setOpen] = useState(false);
  const { token } = useContext(AuthContext); // Access login method from AuthContext

  // const { token } = use

  // const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [page, setPage] = useState(0);

  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [users, setUsers] = useState([]);

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('fullName');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('customer');
  const [formGender, setFormGender] = useState('male');
  const [formState, setFormState] = useState('');
  const [formZipcode, setFormZipcode] = useState('');
  const [formFile, setFormFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [stateError, setStateError] = useState('');
  const [zipcodeError, setZipcodeError] = useState('');

  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [severity, setSeverity] = useState('success'); // 'success', 'error', etc.
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get('/user/getUsers');
        console.log(response);
        setUsers(response.data.users);
      } catch (error) {
        console.log("Error fetching users", error);
      }
    };

    fetchUsers();
  }, []);

  const validateForm = () => {
    let valid = true;

    // Reset previous error messages
    setFullNameError('');
    setEmailError('');
    setPhoneError('');
    setPasswordError('');
    setStateError('');
    setZipcodeError('');

    // Full Name validation
    if (!formFullName.trim() || formFullName.length > 100) {
      setFullNameError('Full name is required (max 100 chars)');
      valid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formEmail) {
      setEmailError('Email is required');
      valid = false;
    } else if (!emailRegex.test(formEmail)) {
      setEmailError('Invalid email format');
      valid = false;
    }

    // Phone validation 10–15 digits
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!formPhone) {
      setPhoneError('Phone number is required');
      valid = false;
    } else if (!phoneRegex.test(formPhone)) {
      setPhoneError('Phone must be 10–15 digits');
      valid = false;
    }

    // Password validation
    if (!editingUser) {
      const complexity = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
      if (!formPassword) {
        setPasswordError('Password is required');
        valid = false;
      } else if (!complexity.test(formPassword)) {
        setPasswordError('Password must be 8+ chars with upper, lower, number, special');
        valid = false;
      }
    }

    if (!formState.trim()) {
      setStateError('State is required');
      valid = false;
    }
    if (!formZipcode.trim()) {
      setZipcodeError('Zipcode is required');
      valid = false;
    }

    return valid;
  };

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleSnackBarClose = (event, reason) => {
    setSnackBarOpen(false);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = users.map((n) => n.fullName);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleOpenModal = () => {
    setEditingUser(null);
    setFormFullName('');
    setFormEmail('');
    setFormPhone('');
    setFormPassword('');
    setFormRole('customer');
    setFormGender('male');
    setFormState('');
    setFormZipcode('');
    setFormFile(null);
    setImagePreview(null);
    setOpenModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormFullName(user.fullName || '');
    setFormEmail(user.email || '');
    setFormPhone(user.phone || '');
    setFormPassword('');
    setFormRole(user.role || 'customer');
    setFormGender(user.gender || 'male');
    setFormState(user.state || '');
    setFormZipcode(user.zipcode || '');
    setFormFile(null);
    setImagePreview(user.profileImage || null);
    setOpenModal(true);
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
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const dataFiltered = applyFilter({
    inputData: users,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Prepare form data
    const formData = new FormData();
    formData.append('fullName', formFullName);
    formData.append('email', formEmail);
    formData.append('phone', formPhone);
    formData.append('role', formRole);
    formData.append('gender', formGender);
    formData.append('state', formState);
    formData.append('zipcode', formZipcode);
    if (!editingUser) {
      formData.append('password', formPassword);
    }
    if (formFile) formData.append('file', formFile);

    try {
      setIsSubmitting(true);
      if (editingUser) {
        const response = await axiosInstance.put(`/user/user/${editingUser.id}`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        if (response.status === 200) {
          handleCloseModal();
          setSnackbarMessage('User updated successfully!');
          setSeverity('success');
          setSnackBarOpen(true);
          const updated = response.data.user || response.data;
          setUsers((prev) => prev.map(u => (u.id === editingUser.id ? updated : u)));
        }
      } else {
        const response = await axiosInstance.post('/user/createUser', formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data', // This is usually set automatically by Axios when using FormData
          },
        });
        if (response.status === 201) {
          handleCloseModal();
          setSnackbarMessage('User added successfully!');
          setSeverity('success');
          setSnackBarOpen(true);
          const newUser = response.data.user;
          setUsers((prev) => [...prev, newUser]);
        }
      }
    } catch (error) {
      console.error('Error adding user:', error);
      setSnackbarMessage(error?.response?.data?.message || 'Error adding user. Please try again.');
      setSeverity('error');
      setSnackBarOpen(true);
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Users</Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" color="primary" onClick={() => exportUsersToCSV(users)}>
            Export CSV
          </Button>
          <Button variant="contained" color="inherit" onClick={handleOpenModal} startIcon={<Iconify icon="eva:plus-fill" />}>
            New User
          </Button>
        </Stack>
      </Stack>

      <Card>
        <UserTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={order}
                orderBy={orderBy}
                rowCount={users.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={[
                  { id: 'fullName', label: 'Name' },
                  { id: 'company', label: 'Email' },
                  { id: 'role', label: 'Role' },
                  { id: 'isVerified', label: 'Phone Number', align: 'center' },
                  { id: 'actions', label: 'Actions' },
                ]}
              />
              <TableBody>
                {dataFiltered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => {
                    const randomAvatarIndex = Math.floor(Math.random() * 25) + 1;

                    return (
                      <UserTableRow
                        key={row?.id}
                        id={row?.id}
                        name={row?.fullName}
                        company={row?.email}
                        role={row?.role}
                        avatarUrl={row.profileImage && row.profileImage}
                        isVerified={row?.phone}
                        selected={selected.indexOf(row?.fullName) !== -1}
                        handleClick={(event) => handleClick(event, row?.fullName)}
                        onEdit={handleEditUser}
                        onDeleted={(deletedId)=> setUsers(prev => prev.filter(u => u.id !== deletedId))}
                      />
                    )
                  })}

                <TableEmptyRows
                  height={77}
                  emptyRows={emptyRows(page, rowsPerPage, users.length)}
                />

                {notFound && <TableNoData query={filterName} />}
              </TableBody>
              <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
              >
                <Box sx={style}>
                  <Stack spacing={2} mt={2} width={500}>
                    <TextField id="outlined-basic" label="Heading" variant="outlined" />
                    <TextField id="outlined-basic" label="Description" variant="outlined" />
                    <Button variant="contained" color="inherit">
                      Upload Images
                    </Button>
                  </Stack>
                </Box>
              </Modal>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          page={page}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} borderRadius={3}>
          <Stack spacing={2} mt={2} width={800}>
            <Typography>{editingUser ? 'Edit User' : 'Add New User'}</Typography>
            <TextField
              id="fullName"
              label="Full Name"
              variant="outlined"
              value={formFullName}
              onChange={(e) => setFormFullName(e.target.value)}
              error={!!fullNameError}
              helperText={fullNameError}
            />
            <TextField
              id="email"
              label="Email"
              variant="outlined"
              type='email'
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              error={!!emailError}
              helperText={emailError}

            />
            <TextField
              id="phone"
              label="Phone"
              type='phone'
              variant="outlined"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              error={!!phoneError}
              helperText={phoneError}

            />
            <Stack direction="row" spacing={2}>
              <TextField 
                id="role" 
                label="Role" 
                variant="outlined" 
                value={formRole} 
                onChange={(e)=> setFormRole(e.target.value)} 
                helperText="e.g., customer, admin, vendor" 
              />
              <TextField 
                id="gender" 
                label="Gender" 
                variant="outlined" 
                value={formGender} 
                onChange={(e)=> setFormGender(e.target.value)} 
                helperText="male, female, other" 
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField 
                id="state" 
                label="State" 
                variant="outlined" 
                value={formState} 
                onChange={(e)=> setFormState(e.target.value)} 
                error={!!stateError} 
                helperText={stateError} 
              />
              <TextField 
                id="zipcode" 
                label="Zipcode" 
                variant="outlined" 
                value={formZipcode} 
                onChange={(e)=> setFormZipcode(e.target.value)} 
                error={!!zipcodeError} 
                helperText={zipcodeError} 
              />
            </Stack>
            <TextField
              id="password"
              label="Password"
              type='password'
              variant="outlined"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              error={!!passwordError}
              helperText={passwordError}
              disabled={!!editingUser}
            />
            {imagePreview && (
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 1,
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: 'background.default',
              }}>
                <Box
                  component='img'
                  src={imagePreview}
                  alt='Preview'
                  sx={{
                    height: 120,
                    width: 160,
                    objectFit: 'cover',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                />
              </Box>
            )}
            <Stack direction='row' spacing={2} alignItems='center'>
              <Button
                variant="contained"
                component="label"
                color="info"
              >
                Upload Image
                <input
                  key={imagePreview || 'no-preview'}
                  type="file"
                  hidden
                  accept='image/*'
                  onChange={(e) => {
                    const f = e.target.files && e.target.files[0];
                    if (!f) return;
                    if (!/image\/(jpeg|png)/.test(f.type) || f.size > 2 * 1024 * 1024) {
                      setSnackbarMessage('Only JPG/PNG up to 2MB');
                      setSeverity('error');
                      setSnackBarOpen(true);
                      return;
                    }
                    setFormFile(f);
                    setImagePreview(URL.createObjectURL(f));
                  }}
                />
              </Button>
              {formFile && (
                <Button
                  variant='text'
                  color='error'
                  onClick={() => {
                    setFormFile(null);
                    setImagePreview(null);
                  }}
                >
                  Remove
                </Button>
              )}
            </Stack>

            <Button
              variant="contained"
              color="inherit"
              sx={{ width: '150px', alignSelf: 'center' }}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Snackbar open={snackBarOpen} autoHideDuration={6000} onClose={handleSnackBarClose}>
        <Alert
          onClose={handleSnackBarClose}
          severity={severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <Backdrop open={isSubmitting} sx={{ zIndex: (t) => t.zIndex.modal + 1, color: '#fff' }}>
        <CircularProgress color='inherit' />
      </Backdrop>
    </Container>
  );
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};
