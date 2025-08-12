import { useState, useContext, useEffect } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Iconify from "src/components/iconify";
import Snackbar from "@mui/material/Snackbar";
import { Alert } from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import React from "react";
import PostCard from "../post-card";
import axiosInstance from "src/api/axiosInstance";
import AuthContext from "src/context/AuthContext";

export default function BlogView() {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [heading, setHeading] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [severity, setSeverity] = useState("success");

  const [blogs, setBlogs] = useState([]);
  const [editingBlog, setEditingBlog] = useState(null); 

  const { token, user } = useContext(AuthContext);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    clearForm(); // Clear form when modal closes
  };

  // Clear form after closing modal or after submission
  const clearForm = () => {
    setDescription("");
    setHeading("");
    setCategory("");
    setImage(null);
    setImagePreview(null);
    setEditingBlog(null); // Reset editing state
  };


  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleHeadingChange = (event) => {
    setHeading(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleImageChange = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    // Blogs: only images allowed
    if (!file.type.startsWith('image/')) {
      setSeverity('error');
      setSnackbarMessage('Only image files are allowed for blogs.');
      setSnackBarOpen(true);
      return;
    }
    setImage(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleSnackBarClose = (event, reason) => {
    setSnackBarOpen(false);
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog); // Set the blog to be edited
    setHeading(blog.heading); // Set form values
    setCategory(blog.category);
    setDescription(blog.description);
    // Show existing image in preview if available
    setImage(null);
    setImagePreview(blog.image || blog.imageUrl || null);
    setOpen(true); // Open the modal
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!heading.trim() || !category.trim() || !description.trim()) {
      setSeverity("error");
      setSnackbarMessage("Heading, Category, and Description are required.");
      setSnackBarOpen(true);
      return;
    }

    if (!user || !user.id || !token) {
      setSeverity("error");
      setSnackbarMessage("You must be logged in to create or update a blog.");
      setSnackBarOpen(true);
      return;
    }

    const formData = new FormData();
    formData.append("description", description);
    formData.append("heading", heading);
    formData.append("category", category);
    if (image) {
      formData.append("file", image);
    }
    formData.append("userId", user.id);

    setIsSubmitting(true);
    try {
      if (editingBlog) {
        const response = await axiosInstance.put(`/blogs/updateBlog/${editingBlog.id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          handleClose();
          setSeverity("success");
          setSnackbarMessage("Blog updated successfully!");
          setSnackBarOpen(true);
          setBlogs((prev) => prev.map((blog) => (blog.id === editingBlog.id ? response.data.blog : blog)));
        }
      } else {
        const response = await axiosInstance.post("/blogs/createBlog", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 201) {
          handleClose();
          setSeverity("success");
          setSnackbarMessage("Blog added successfully!");
          setSnackBarOpen(true);
          const newBlog = response.data.blog;
          setBlogs((prev) => [...prev, newBlog]);
        }
      }
    } catch (error) {
      console.error("Error submitting blog:", error);
      setSeverity("error");
      setSnackbarMessage("Error submitting blog. Please try again.");
      setSnackBarOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axiosInstance.get("/blogs/getAllBlogs");
        console.log(response);
        setBlogs(response.data.blogs);
      } catch (error) {
        console.log("Error fetching blogs", error);
      }
    };

    fetchBlogs();
  }, []);

  console.log("User", user);
  console.log("image", image);

  return (
    <Container>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={5}
      >
        <Typography variant="h4">Blog</Typography>

        <Button
          variant="contained"
          color="inherit"
          onClick={handleOpen}
          startIcon={<Iconify icon="eva:plus-fill" />}
        >
          Add Blog
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
            <Typography variant="h6" sx={{ mb: 2 }}>
              {editingBlog ? "Edit Blog" : "Add Blog"}
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2} mt={2} width={800}>
                <TextField
                  label="Heading"
                  variant="outlined"
                  value={heading}
                  onChange={handleHeadingChange}
                  required
                />
                <TextField
                  label="Category"
                  variant="outlined"
                  value={category}
                  onChange={handleCategoryChange}
                  required
                />
                <div className="mb-[100px] h-[300px]">
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Description</Typography>
                  <ReactQuill
                    theme="snow"
                    value={description}
                    onChange={setDescription}
                  />
                </div>
                <Stack spacing={2}>
                  {imagePreview && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 1,
                        border: '1px dashed',
                        borderColor: 'divider',
                        borderRadius: 1,
                        bgcolor: 'background.default',
                      }}
                    >
                      <Box
                        component="img"
                        src={imagePreview}
                        alt="Selected preview"
                        sx={{
                          height: 120,
                          width: 160,
                          objectFit: 'cover',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      />
                      <Stack spacing={1}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{image?.name}</Typography>
                      </Stack>
                    </Box>
                  )}
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Button
                      variant="contained"
                      component="label"
                      color="inherit"
                      disabled={isSubmitting}
                    >
                      Upload Image
                      <input key={imagePreview || 'no-preview'} type="file" accept="image/*" hidden onChange={handleImageChange} />
                    </Button>
                    {image && <Button variant="text" color="error" disabled={isSubmitting} onClick={() => { setImage(null); setImagePreview(null); }}>Remove</Button>}
                  </Stack>
                </Stack>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button variant="outlined" color="inherit" onClick={handleClose} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving…' : 'Save'}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Modal>
      </Stack>

      <Grid container spacing={3}>
        {blogs.map((post, index) => (
          <PostCard
            key={post.id}
            post={post}
            index={index}
            onEdit={handleEdit}
            onDelete={(id) => setBlogs((prev) => prev.filter((b) => b.id !== id))}
          />
        ))}
      </Grid>
      <Snackbar
        open={snackBarOpen}
        autoHideDuration={6000}
        onClose={handleSnackBarClose}
      >
        <Alert
          onClose={handleSnackBarClose}
          severity={severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};
