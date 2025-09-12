/* eslint-disable */

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';

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
  row,
  selected,
  handleClick,
  onEdit,
  onDeleted,
}) {
  const { id, fullName, email, phone, role, gender, state, zipcode, profileImage } = row;

  const [openModal, setOpenModal] = useState(false);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedID, setSelectedID] = useState(null);



  const [userData, setUserData] = useState([]);

  const { token } = useContext(AuthContext); // Access login method from AuthContext

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

        <TableCell component="th" scope="row" padding="none" onClick={() => setOpenModal(true)}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar alt={fullName} src={profileImage} />
            <Typography variant="subtitle2" noWrap>
              {fullName}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>{email}</TableCell>
        <TableCell>{phone}</TableCell>
        <TableCell>{role}</TableCell>

        <TableCell>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Edit User" arrow>
              <IconButton
                size="small"
                color="primary"
                // 🔑 pura row bhej do
                onClick={() => onEdit && onEdit(row)}
              >
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
      </TableRow>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} borderRadius={3}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar alt={fullName} src={profileImage} style={{ height: 70, width: 70 }} />
            <Typography
              variant="subtitle2"
              noWrap
              style={{ marginRight: '8px', fontWeight: 600, fontSize: 20 }}
            >
              {fullName}
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
                {email}
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
                {phone ? phone : 'N/A'}
              </p>
            </Stack>
            <Stack spacing={1} mt={2} sx={{ marginRight: 2, marginBottom: 2 }}>
              <span style={{ marginRight: '8px', fontWeight: 600 }}>Gender</span>
              <p
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  display: 'inline-block',
                }}
              >
                {gender}
              </p>
            </Stack>
            <Stack spacing={1} mt={2} sx={{ marginRight: 2, marginBottom: 2 }}>
              <span style={{ marginRight: '8px', fontWeight: 600 }}>State</span>
              <p
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  display: 'inline-block',
                }}
              >
                {state}
              </p>
            </Stack>
            <Stack spacing={1} mt={2} sx={{ marginRight: 2, marginBottom: 2 }}>
              <span style={{ marginRight: '8px', fontWeight: 600 }}>Zipcode</span>
              <p
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  display: 'inline-block',
                }}
              >
                {zipcode}
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
  row: PropTypes.shape({
    id: PropTypes.string.isRequired,
    fullName: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    role: PropTypes.string,
    gender: PropTypes.string,
    state: PropTypes.string,
    zipcode: PropTypes.string,
    profileImage: PropTypes.string,
  }).isRequired,
  selected: PropTypes.bool,
  handleClick: PropTypes.func,
  onEdit: PropTypes.func,
  onDeleted: PropTypes.func,
};
