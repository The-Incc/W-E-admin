/* eslint-disable */
import { useContext, useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import { Alert } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import AuthContext from 'src/context/AuthContext';
import axiosInstance from 'src/api/axiosInstance';

export default function ProfileView() {
  const { user, token } = useContext(AuthContext);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);

  // Current password is displayed masked and not editable per requirements
  const [currentPasswordMasked] = useState('********');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [severity, setSeverity] = useState('success');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setProfilePreview(user.profileImage || null);
    }
  }, [user]);

  const handleSnackBarClose = () => setSnackBarOpen(false);

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setSeverity('error');
      setSnackbarMessage('Only image files are allowed.');
      setSnackBarOpen(true);
      return;
    }
    setProfileImage(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('email', email);
    if (profileImage) formData.append('file', profileImage);

    setIsSubmitting(true);
    try {
      const res = await axiosInstance.put('/user/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      if (res.status === 200) {
        setSeverity('success');
        setSnackbarMessage('Profile updated successfully');
        setSnackBarOpen(true);
        // optionally refresh user from /auth/me
      }
    } catch (err) {
      setSeverity('error');
      setSnackbarMessage('Failed to update profile');
      setSnackBarOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validatePasswordForm = () => {
    let valid = true;
    setNewPasswordError('');
    setConfirmPasswordError('');

    // Required
    if (!newPassword) {
      setNewPasswordError('New password is required');
      valid = false;
    }

    // Complexity: at least 8 chars, uppercase, lowercase, number, special
    const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (newPassword && !complexityRegex.test(newPassword)) {
      setNewPasswordError(
        'Must be 8+ chars with uppercase, lowercase, number, and special character'
      );
      valid = false;
    }

    // Must differ from current (masked/unknown current -> enforce not equal to masked value)
    if (newPassword && newPassword === currentPasswordMasked) {
      setNewPasswordError('New password must be different from current password');
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Confirm password is required');
      valid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      valid = false;
    }

    return valid;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;
    setIsSubmitting(true);
    try {
      const res = await axiosInstance.put('/user/password', {
        newPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 200) {
        setSeverity('success');
        setSnackbarMessage('Password changed successfully');
        setSnackBarOpen(true);
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setSeverity('error');
      setSnackbarMessage('Failed to change password');
      setSnackBarOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <Backdrop open={isSubmitting} sx={{ zIndex: (t) => t.zIndex.modal + 1, color: '#fff' }}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Typography variant="h4" sx={{ mb: 5 }}>Profile</Typography>

      <Stack spacing={3}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Profile Settings</Typography>
          <Stack spacing={2} component="form" onSubmit={handleUpdateProfile}>
            <TextField label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
            {profilePreview && (
              <Box component="img" src={profilePreview} alt="Profile" sx={{ width: 120, height: 120, borderRadius: 2 }} />
            )}
            <Button variant="contained" component="label" color="inherit" sx={{ width: 180 }} disabled={isSubmitting}>
              Upload Image
              <input type="file" accept="image/*" hidden onChange={handleImageChange} />
            </Button>
            <Stack direction="row" spacing={2}>
              <Button type="button" variant="outlined" color="inherit" disabled={isSubmitting} onClick={()=>{ setFullName(user?.fullName||''); setEmail(user?.email||''); setProfileImage(null); setProfilePreview(user?.profileImage||null);}}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>Save</Button>
            </Stack>
          </Stack>
        </Card>

        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Change Password</Typography>
          <Stack spacing={2} component="form" onSubmit={handleChangePassword}>
            <TextField label="Current Password" type="password" value={currentPasswordMasked} disabled />
            <TextField
              label="New Password"
              type="password"
              required
              value={newPassword}
              onChange={(e)=>setNewPassword(e.target.value)}
              error={!!newPasswordError}
              helperText={newPasswordError}
            />
            <TextField
              label="Confirm New Password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e)=>setConfirmPassword(e.target.value)}
              error={!!confirmPasswordError}
              helperText={confirmPasswordError}
            />
            <Stack direction="row" spacing={2}>
              <Button type="button" variant="outlined" color="inherit" disabled={isSubmitting} onClick={()=>{ setNewPassword(''); setConfirmPassword(''); setNewPasswordError(''); setConfirmPasswordError(''); }}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary" disabled={isSubmitting || !!newPasswordError || !!confirmPasswordError}>Update Password</Button>
            </Stack>
          </Stack>
        </Card>
      </Stack>

      <Snackbar open={snackBarOpen} autoHideDuration={6000} onClose={handleSnackBarClose}>
        <Alert onClose={handleSnackBarClose} severity={severity} variant="filled" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

