/* eslint-disable */
import Iconify from 'src/components/iconify';
import PostCard from '../post-card';
import PostSort from '../post-sort';
import PostSearch from '../post-search';
import { useState, useContext, useEffect } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import { Alert } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { posts } from 'src/_mock/blog';
import axiosInstance from 'src/api/axiosInstance';


import AuthContext from 'src/context/AuthContext';

// ----------------------------------------------------------------------

export default function TestimonialView() {
  const [open, setOpen] = useState(false);

  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState('');
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [severity, setSeverity] = useState('success');

  const [testimonials, setTestimonials] = useState([]);

  const [nameError, setNameError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [videoError, setVideoError] = useState('');







  const { token } = useContext(AuthContext);

  const handleOpen = () => setOpen(true);
  // const handleClose = () => setOpen(false);
  const handleClose = () => {
    setOpen(false);
    setName('');
    setDescription('');
    setLocation('');
    setImage(null);
    setImagePreview(null);
    setEditingTestimonial(null);
    setNameError('');
    setDescriptionError('');
    setLocationError('');
    setVideoError('');
  };


  const handleDescriptionChange = (value) => {
    setDescription(value);
    if (descriptionError && value.trim()) {
      setDescriptionError('');
    }
  };


  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleLocationChange = (event) => {
    setLocation(event.target.value);
  };

  // const handleImageChange = (event) => {
  //   const file = event.target.files && event.target.files[0];
  //   if (!file) return;
  //   if (!file.type.startsWith('video/')) {
  //     setSeverity('error');
  //     setSnackbarMessage('Only video files are allowed for testimonials.');
  //     setSnackBarOpen(true);
  //     return;
  //   }
  //   setImage(file);
  //   const previewUrl = URL.createObjectURL(file);
  //   setImagePreview(previewUrl);
  // };
  const handleImageChange = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setSeverity('error');
      setSnackbarMessage('Only video files are allowed for testimonials.');
      setSnackBarOpen(true);
      return;
    }
    setImage(file);
    setImagePreview(URL.createObjectURL(file));

    // agar error pehle thi to hata do
    if (videoError) setVideoError('');
  };


  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleSnackBarClose = (event, reason) => {
    setSnackBarOpen(false);
  };

  const handleEdit = (testimonial) => {
    setEditingTestimonial(testimonial);
    setName(testimonial.name || '');
    setDescription(testimonial.description || '');
    setLocation(testimonial.location || '');
    setImage(null);
    setImagePreview(testimonial.video_link || testimonial.video || testimonial.videoUrl || testimonial.mediaUrl || null);
    setOpen(true);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;

    if (!name.trim()) {
      setNameError('Name is required');
      hasError = true;
    } else {
      setNameError('');
    }

    if (!description.trim()) {
      setDescriptionError('Description is required');
      hasError = true;
    } else {
      setDescriptionError('');
    }

    if (!location.trim()) {
      setLocationError('Location is required');
      hasError = true;
    } else {
      setLocationError('');
    }

    if (!image) {
      setVideoError('Video is required');
      hasError = true;
    } else {
      setVideoError('');
    }


    if (hasError) return; // stop form submission if any error

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('location', location);
    if (image) {
      formData.append('file', image);
    }

    try {
      setIsSubmitting(true);
      if (editingTestimonial) {
        // Update existing testimonial (backend commonly expects POST for multipart updates)
        const response = await axiosInstance.put(`/testimonial/updateTestimonial/${editingTestimonial.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          handleClose();
          setSeverity('success');
          setSnackbarMessage('Testimonial updated successfully!');
          setSnackBarOpen(true);
          const updated = response.data.testimonial || response.data.data || response.data;
          setTestimonials((prev) => prev.map((t) => (t.id === editingTestimonial.id ? updated : t)));
          setEditingTestimonial(null);
        }
      } else {
        // Create new testimonial
        const response = await axiosInstance.post('/testimonial/add-testimonial', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 201) {
          handleClose();
          setSeverity('success');
          setSnackbarMessage('Testimonial added successfully!');
          setSnackBarOpen(true);
          const newTestimonial = response.data.testimonial;
          setTestimonials((prev) => [...prev, newTestimonial]);
        }
      }
    } catch (error) {
      console.error('Error adding Testimonial:', error);
      setSeverity('error');
      setSnackbarMessage('Error saving Testimonial. Please try again.');
      setSnackBarOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };


  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await axiosInstance.get('/testimonial/get-all-testimonials');
        console.log(response.data.testimonials);
        setTestimonials(response.data.testimonials);
      } catch (error) {
        console.log("Error fetching testimonials", error);
      }
    };

    fetchTestimonials();
  }, []);


  return (
    <Container>

      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Testimonial</Typography>

        <Button
          variant="contained"
          color="inherit"
          onClick={handleOpen}
          startIcon={<Iconify icon="eva:plus-fill" />}
        >
          Add Testimonial
        </Button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style} borderRadius={3}>
            <Backdrop open={isSubmitting} sx={{ zIndex: (theme) => theme.zIndex.modal + 1, color: '#fff' }}>
              <CircularProgress color="inherit" />
            </Backdrop>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2} mt={2} width={800}>


                <TextField
                  label="Name"
                  variant="outlined"
                  value={name}
                  onChange={handleNameChange}
                  error={!!nameError}
                  helperText={nameError}
                  sx={{
                    '& .MuiOutlinedInput-root.Mui-error': {
                      '& fieldset': { borderColor: '#FF5630' },
                    },
                    '& .MuiFormHelperText-root': { color: '#FF5630' },
                  }}
                />

                <Box
                  sx={{
                    border: descriptionError ? '1px solid #FF5630' : '1px solid #ccc',
                    borderRadius: 1,
                    mb: descriptionError ? 1 : 2,
                    overflow: 'hidden',
                    '& .ql-container': {
                      minHeight: 120,
                      border: 'none',
                    },
                  }}
                >
                  <ReactQuill
                    theme="snow"
                    value={description}
                    onChange={handleDescriptionChange}
                  />
                </Box>

                {descriptionError && (
                  <Typography variant="caption" sx={{ color: '#FF5630', pl: 1.5 }}>
                    {descriptionError}
                  </Typography>
                )}

                <TextField
                  label="Location"
                  variant="outlined"
                  value={location}
                  onChange={handleLocationChange}
                  error={!!locationError}
                  helperText={locationError}
                  sx={{
                    '& .MuiOutlinedInput-root.Mui-error': {
                      '& fieldset': {
                        borderColor: '#FF5630',
                      },
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#FF5630',
                    },
                  }}
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
                    <video width="320" height="180" controls style={{ borderRadius: 6, border: '1px solid', borderColor: 'divider' }}>
                      <source src={imagePreview} type={image?.type || 'video/mp4'} />
                      Your browser does not support the video tag.
                    </video>
                  </Box>
                )}

                <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-start">
                  <Button
                    variant="contained"
                    component="label"
                    color="inherit"
                  >
                    Upload Video
                    <input type="file" accept="video/*" hidden onChange={handleImageChange} />
                  </Button>
                  {imagePreview && (
                    <Button variant="text" color="error" onClick={() => { setImage(null); setImagePreview(null); }}>
                      Remove
                    </Button>
                  )}



                </Stack>


                {videoError && !imagePreview && (
                  <Typography variant="caption" sx={{ color: '#FF5630', pl: 1.5 }}>
                    {videoError}
                  </Typography>
                )}


                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button variant="outlined" color="inherit" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button variant="contained" color="primary" type="submit">
                    Save
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Modal>
      </Stack>

      <Stack mb={5} direction="row" alignItems="center" justifyContent="space-between"></Stack>

      <Grid container spacing={3}>
        {testimonials.map((post, index) => (
          <PostCard key={post.id} post={post} index={index} onEdit={handleEdit} />
        ))}
      </Grid>
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
