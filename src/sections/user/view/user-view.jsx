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

export default function UserPage() {
  const [open, setOpen] = useState(false);
  const { token } = useContext(AuthContext); // Access login method from AuthContext

  // const { token } = use

  // const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [page, setPage] = useState(0);

  const [openModal, setOpenModal] = useState(false);

  const [users, setUsers] = useState([]);

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('fullName');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formFile, setFormFile] = useState(null);

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');


  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [severity, setSeverity] = useState('success'); // 'success', 'error', etc.


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
    setNameError('');
    setEmailError('');
    setPhoneError('');
    setPasswordError('');

    // Name validation
    if (!formName.trim()) {
      setNameError('Name is required');
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

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/; // Adjust this regex as needed for your phone format
    if (!formPhone) {
      setPhoneError('Phone number is required');
      valid = false;
    } else if (!phoneRegex.test(formPhone)) {
      setPhoneError('Invalid phone number format (e.g., 1234567890)');
      valid = false;
    }

    // Password validation
    if (!formPassword) {
      setPasswordError('Password is required');
      valid = false;
    } else if (formPassword.length < 6) {
      setPasswordError('Password should be at least 6 characters long');
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
    formData.append('name', formName);
    formData.append('email', formEmail);
    formData.append('phone', formPhone);
    formData.append('password', formPassword);
    formData.append('file', formFile); // Append the file

    try {
      // Send form data to the backend API
      const response = await axiosInstance.post('/user/createAdminUser', formData, {
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
    } catch (error) {
      console.error('Error adding user:', error);
      setSnackbarMessage('Error adding user. Please try again.');
      setSeverity('error');
      setSnackBarOpen(true);
    }
  };



  const notFound = !dataFiltered.length && !!filterName;

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Users</Typography>

        <Button variant="contained" color="inherit" onClick={handleOpenModal} startIcon={<Iconify icon="eva:plus-fill" />}>
          New User
        </Button>
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
                  { id: 'status', label: 'Status' },
                  { id: 'actions', label: 'Actions' },
                  { id: '' },
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
                        role={row?.role}
                        status={row?.status}

                        avatarUrl={row.profileImage && row.profileImage}
                        isVerified={row?.phone}
                        selected={selected.indexOf(row?.fullName) !== -1}
                        handleClick={(event) => handleClick(event, row?.fullName)}
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
            <Typography>Add New User</Typography>
            <TextField
              id="name"
              label="Name"
              variant="outlined"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              error={!!nameError}
              helperText={nameError}
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
            <TextField
              id="password"
              label="Password"
              type='password'
              variant="outlined"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              error={!!passwordError}
              helperText={passwordError}

            />
            <Button
              variant="contained"
              component="label"
              color="info"
            >
              Upload File
              <input
                type="file"
                hidden
                onChange={(e) => setFormFile(e.target.files[0])} // Capture the selected file
              />
            </Button>

            <Button
              variant="contained"
              color="inherit"
              sx={{ width: '150px', alignSelf: 'center' }}
              onClick={handleSubmit} // Handle form submission
            >
              Save
            </Button>
          </Stack>
        </Box>
        {/* <Box sx={style} borderRadius={3}> */}
        {/* <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar alt={name} src={avatarUrl} style={{ height: 70, width: 70 }} />
            <Typography
              variant="subtitle2"
              noWrap
              style={{ marginRight: '8px', fontWeight: 600, fontSize: 20 }}
            >
              {name}
            </Typography>
          </Stack>
          <Box mt={3}>
            <span style={{ fontWeight: 600, fontSize: 18 }}>Personal Information:</span>
          </Box>
          <Box direction="row" spacing={4} sx={{ display: 'inline-flex', flexWrap: 'wrap' }}>
            <Stack spacing={1} mt={2} sx={{ marginRight: 2, marginBottom: 2 }}>
              <span style={{ marginRight: '8px', fontWeight: 600 }}>Email</span>
              <p
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  display: 'inline-block',
                }}
              >
                {company}
              </p>
            </Stack>
            <Stack spacing={1} mt={2} sx={{ marginRight: 2, marginBottom: 2 }}>
              <span style={{ marginRight: '8px', fontWeight: 600 }}>Phone Number</span>
              <p
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  display: 'inline-block',
                }}
              >
                {isVerified ? isVerified : 'N/A'}
              </p>
            </Stack>
          </Box>
          <Box mt={1}>
            <span style={{ fontWeight: 600, fontSize: 18 }}>Calculator Results:</span>
          </Box>{' '}
          <Box direction="row" spacing={4} sx={{ display: 'inline-flex', flexWrap: 'wrap' }}>
            <Stack spacing={1} mt={2} sx={{ marginRight: 2, marginBottom: 2 }}>
              <span style={{ marginRight: '8px', fontWeight: 600 }}>Income Replacement</span>
              <p
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  display: 'inline-block',
                }}
              >
                $ {userData?.annualIncome}
              </p>
            </Stack>
            <Stack spacing={1} mt={2} sx={{ marginRight: 2, marginBottom: 2 }}>
              <span style={{ marginRight: '8px', fontWeight: 600 }}>Debt Elimination</span>
              <p
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  display: 'inline-block',
                }}
              >
                $ {userData?.eliminateDebt}
              </p>
            </Stack>{' '}
            <Stack spacing={1} mt={2} sx={{ marginRight: 2, marginBottom: 2 }}>
              <span style={{ marginRight: '8px', fontWeight: 600 }}>Childcare</span>
              <p
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  display: 'inline-block',
                }}
              >
                $ {userData?.childcare}
              </p>
            </Stack>{' '}
            <Stack spacing={1} mt={2} sx={{ marginRight: 2, marginBottom: 2 }}>
              <span style={{ marginRight: '8px', fontWeight: 600 }}>Extended Healthcare</span>
              <p
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  display: 'inline-block',
                }}
              >
                $ {userData?.extendedHealthcare}
              </p>
            </Stack>{' '}
            <Stack spacing={1} mt={2} sx={{ marginRight: 2, marginBottom: 2 }}>
              <span style={{ marginRight: '8px', fontWeight: 600 }}>Education Fund</span>
              <p
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  display: 'inline-block',
                }}
              >
                $300,000
              </p>
            </Stack>
            <Stack spacing={1} mt={2} sx={{ marginRight: 2, marginBottom: 2 }}>
              <span style={{ marginRight: '8px', fontWeight: 600 }}>Emergency Fund</span>
              <p
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  display: 'inline-block',
                }}
              >
                $ {userData?.emergencyFund}
              </p>
            </Stack>
            <Stack spacing={1} mt={2} sx={{ marginRight: 2, marginBottom: 2 }}>
              <span style={{ marginRight: '8px', fontWeight: 600 }}>Final Expenses </span>
              <p
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  display: 'inline-block',
                }}
              >
                $ {userData?.finalExpense}
              </p>
            </Stack> */}
        {/* </Box>
        </Box> */}
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
