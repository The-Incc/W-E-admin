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
import Grid from '@mui/material/Grid';

import Iconify from 'src/components/iconify';
import axiosInstance from 'src/api/axiosInstance';
import AuthContext from 'src/context/AuthContext';
import { useContext } from 'react';
import { fDateTime } from 'src/utils/format-time';

function formatDollar(val) {
  if (val === undefined || val === null || val === '') return '0.00';
  const n = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.-]/g, '')) : Number(val);
  if (Number.isNaN(n)) return '0.00';
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ----------------------------------------------------------------------

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 900,
  maxWidth: '90vw',
  maxHeight: '90vh',
  overflow: 'auto',
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



  const [userData, setUserData] = useState(null);

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
    const fetchResultsById = async (userId) => {
      if (!userId) return;
      
      try {
        const response = await axiosInstance.get(`calculate/results/${userId}`);
        console.log('API Response:', response.data);
        
        // Handle different response structures
        if (response.data && response.data.results && response.data.results.length > 0) {
          setUserData(response.data.results[0]);
        } else if (response.data && !response.data.results) {
          // If results is not an array, use the data directly
          setUserData(response.data);
        } else {
          console.warn('No results data found in response');
          setUserData(null);
        }
      } catch (error) {
        console.error('Error fetching results:', error);
        setUserData(null);
      }
    };

    if (id) {
      fetchResultsById(id);
    }
  }, [id])

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

          <Box mt={3} mb={2}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Personal Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Email
                  </Typography>
                  <Box
                    sx={{
                      backgroundColor: '#f5f5f5',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      minHeight: '40px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="body2">{email || 'N/A'}</Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Phone Number
                  </Typography>
                  <Box
                    sx={{
                      backgroundColor: '#f5f5f5',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      minHeight: '40px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="body2">{phone || 'N/A'}</Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Gender
                  </Typography>
                  <Box
                    sx={{
                      backgroundColor: '#f5f5f5',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      minHeight: '40px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="body2">{gender || 'N/A'}</Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    State
                  </Typography>
                  <Box
                    sx={{
                      backgroundColor: '#f5f5f5',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      minHeight: '40px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="body2">{state || 'N/A'}</Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Zipcode
                  </Typography>
                  <Box
                    sx={{
                      backgroundColor: '#f5f5f5',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      minHeight: '40px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="body2">{zipcode || 'N/A'}</Typography>
                  </Box>
                </Stack>
              </Grid>
              {userData && userData.age && (
                <Grid item xs={12} sm={6} md={4}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Age
                    </Typography>
                    <Box
                      sx={{
                        backgroundColor: '#f5f5f5',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        minHeight: '40px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="body2">{userData.age}</Typography>
                    </Box>
                  </Stack>
                </Grid>
              )}
            </Grid>
          </Box>

          {/* Calculator Results Section */}
          {userData && (
            <Box mt={4}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Calculator Results
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Date Completed</Typography>
                    <Box sx={{ backgroundColor: '#f5f5f5', borderRadius: '8px', padding: '10px 14px', minHeight: '40px', display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">
                        {userData.dateCompleted ? (new Date(userData.dateCompleted).toLocaleDateString()) : (fDateTime(userData.createdAt || userData.created_at) || 'N/A')}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Annual Income</Typography>
                    <Box sx={{ backgroundColor: '#f5f5f5', borderRadius: '8px', padding: '10px 14px', minHeight: '40px', display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">${formatDollar(userData.annualIncome || userData.annual_income)}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Yrs to Retire</Typography>
                    <Box sx={{ backgroundColor: '#f5f5f5', borderRadius: '8px', padding: '10px 14px', minHeight: '40px', display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">{userData.yearsToRetire ?? userData.years_to_retire ?? userData.yearsToProvide ?? userData.years_to_provide ?? 'N/A'}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>PWP</Typography>
                    <Box sx={{ backgroundColor: '#f5f5f5', borderRadius: '8px', padding: '10px 14px', minHeight: '40px', display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">${formatDollar(userData.pwp)}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Coverage Need</Typography>
                    <Box sx={{ backgroundColor: '#f5f5f5', borderRadius: '8px', padding: '10px 14px', minHeight: '40px', display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">${formatDollar(userData.need)}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Coverage Gap</Typography>
                    <Box sx={{ backgroundColor: '#f5f5f5', borderRadius: '8px', padding: '10px 14px', minHeight: '40px', display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">${formatDollar(userData.gap)}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Income Provide</Typography>
                    <Box sx={{ backgroundColor: '#f5f5f5', borderRadius: '8px', padding: '10px 14px', minHeight: '40px', display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">${formatDollar(userData.annualIncomeToProvide || userData.annual_income_to_provide)}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Years to Provide</Typography>
                    <Box sx={{ backgroundColor: '#f5f5f5', borderRadius: '8px', padding: '10px 14px', minHeight: '40px', display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">{userData.yearsIncomeToProvide ?? userData.years_income_to_provide ?? userData.yearsToProvide ?? userData.years_to_provide ?? 'N/A'}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Income Replacement</Typography>
                    <Box sx={{ backgroundColor: '#f5f5f5', borderRadius: '8px', padding: '10px 14px', minHeight: '40px', display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">
                        ${formatDollar(
                          (userData.annualIncomeToProvide != null && userData.yearsIncomeToProvide != null)
                            ? parseFloat(String(userData.annualIncomeToProvide).replace(/[^0-9.-]/g, '')) * parseFloat(String(userData.yearsIncomeToProvide).replace(/[^0-9.-]/g, ''))
                            : (userData.annual_income_to_provide != null && userData.years_income_to_provide != null)
                              ? parseFloat(String(userData.annual_income_to_provide).replace(/[^0-9.-]/g, '')) * parseFloat(String(userData.years_income_to_provide).replace(/[^0-9.-]/g, ''))
                              : ''
                        )}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Debt Elimination</Typography>
                    <Box sx={{ backgroundColor: '#f5f5f5', borderRadius: '8px', padding: '10px 14px', minHeight: '40px', display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">${formatDollar(userData.debtElimination || userData.eliminateDebt)}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Childcare</Typography>
                    <Box sx={{ backgroundColor: '#f5f5f5', borderRadius: '8px', padding: '10px 14px', minHeight: '40px', display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">${formatDollar(userData.childcare)}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Education Fund</Typography>
                    <Box sx={{ backgroundColor: '#f5f5f5', borderRadius: '8px', padding: '10px 14px', minHeight: '40px', display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">${formatDollar(userData.educationFund || (userData.children && Array.isArray(userData.children) ? userData.children.reduce((s, c) => s + (parseFloat(String(c?.amount || 0).replace(/[^0-9.-]/g, '')) || 0), 0) : ''))}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Emergency Fund</Typography>
                    <Box sx={{ backgroundColor: '#f5f5f5', borderRadius: '8px', padding: '10px 14px', minHeight: '40px', display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">${formatDollar(userData.emergencyFund || userData.emergency_fund)}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Final Expenses</Typography>
                    <Box sx={{ backgroundColor: '#f5f5f5', borderRadius: '8px', padding: '10px 14px', minHeight: '40px', display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">${formatDollar(userData.finalExpense || userData.finalExpenses)}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Life Insurance</Typography>
                    <Box sx={{ backgroundColor: '#f5f5f5', borderRadius: '8px', padding: '10px 14px', minHeight: '40px', display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">${formatDollar(userData.lifeInsurance || userData.life_insurance)}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Type of Insurance</Typography>
                    <Box sx={{ backgroundColor: '#f5f5f5', borderRadius: '8px', padding: '10px 14px', minHeight: '40px', display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">{userData.typeOfInsurance || userData.type_of_insurance || 'N/A'}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Permanent or Employer</Typography>
                    <Box sx={{ backgroundColor: '#f5f5f5', borderRadius: '8px', padding: '10px 14px', minHeight: '40px', display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">{userData.personalOrEmployer || userData.personal_or_employer || userData.insuranceProvider || 'N/A'}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Updated Date</Typography>
                    <Box sx={{ backgroundColor: '#f5f5f5', borderRadius: '8px', padding: '10px 14px', minHeight: '40px', display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">{fDateTime(userData.updatedAt || userData.updated_at) || 'N/A'}</Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          )}
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
