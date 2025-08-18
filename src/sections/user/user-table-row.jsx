/* eslint-disable */

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import axiosInstance from 'src/api/axiosInstance';
import AuthContext from 'src/context/AuthContext';
import { useContext } from 'react';

// ----------------------------------------------------------------------

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

export default function UserTableRow({
  id,
  selected,
  name,
  avatarUrl,
  company,
  role,
  isVerified,
  status,
  handleClick,
  onEdit,
  onDeleted,
}) {
  const [openPopover, setOpenPopover] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedID, setSelectedID] = useState(null);



  const [userData, setUserData] = useState([]);

  const handleOpenMenu = (event) => {
    setOpenPopover(event.currentTarget);
  };

  const { token } = useContext(AuthContext); // Access login method from AuthContext

  const handleCloseMenu = () => {
    setOpenPopover(null);
  };

  const handleOpenDeleteModal = (id) => {
    setSelectedID(id)
    setOpenDeleteModal(true)
  }

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false)
  }

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleDeleteUser = async () => {
    try {
      setOpenDeleteModal(true)
      const response = await axiosInstance.post(`/user/deleteUser/${selectedID}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      console.log(response);
      handleCloseDeleteModal()
      if (onDeleted) onDeleted(selectedID);
    } catch (error) {
      console.error('Error deleting:', error);
    }
  }

  useEffect(() => {
    const fetchResultsById = async (id) => {
      try {
        const response = await axiosInstance.get(`calculate/results/${id}`);
        setUserData(response.data.results[0]);
        console.log(response.data.results); // Handle the response data here
      } catch (error) {
        console.error('Error fetching results:', error);
      }
    };

    fetchResultsById(id)
  }, [])

  console.log(openDeleteModal)

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
          <Checkbox disableRipple checked={selected} onChange={handleClick} />
        </TableCell>

        <TableCell component="th" scope="row" padding="none" onClick={handleOpenModal}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar alt={name} src={avatarUrl} />
            <Typography variant="subtitle2" noWrap>
              {name}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>{company}</TableCell>

        <TableCell>{role}</TableCell>

        <TableCell align="center">{isVerified ? isVerified : 'N/A'}</TableCell>

        <TableCell>
          <Label color={(status === 'banned' && 'error') || 'success'}>{status}</Label>
        </TableCell>


        <TableCell>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Edit User" arrow>
              <IconButton size="small" color="primary" onClick={() => onEdit && onEdit({ id, fullName: name, email: company, phone: isVerified, role, status, avatarUrl })}>
                <Iconify icon="eva:edit-2-outline" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete User" arrow>
              <IconButton size="small" color="error" onClick={() => handleOpenDeleteModal(id)}>
                <Iconify icon="eva:trash-2-outline" />
              </IconButton>
            </Tooltip>
          </Stack>
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenMenu}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      {/* <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 140 },
        }}
      >
        <MenuItem onClick={handleCloseMenu}>
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Edit
        </MenuItem>

        <MenuItem onClick={handleCloseMenu} sx={{ color: 'error.main' }}>
          <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover> */}

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} borderRadius={3}>
          <Stack direction="row" alignItems="center" spacing={2}>
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
                $ {userData?.education}
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
            </Stack>
          </Box>
        </Box>
      </Modal>
      <Modal
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} borderRadius={3}>
          <Stack spacing={2} width={800}></Stack>
          <div>
            <p>Are you sure you want to delete this user?</p>
            <Button
              variant="contained"
              color="error"
              sx={{ width: '150px', alignSelf: 'center' }}
              onClick={handleDeleteUser}
            >
              Yes
            </Button>
            <Button
              variant="contained"
              color="inherit"
              sx={{ width: '150px', alignSelf: 'center', marginLeft: '20px' }}
              mr={4}
              onClick={handleCloseDeleteModal}
            >
              No
            </Button>
          </div>
        </Box>
      </Modal>
    </>
  );
}

UserTableRow.propTypes = {
  avatarUrl: PropTypes.any,
  company: PropTypes.any,
  handleClick: PropTypes.func,
  isVerified: PropTypes.any,
  name: PropTypes.any,
  role: PropTypes.any,
  selected: PropTypes.any,
  status: PropTypes.string,
};
