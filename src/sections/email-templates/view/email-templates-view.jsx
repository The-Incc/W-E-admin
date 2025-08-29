import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import toast from 'react-hot-toast';

// @mui
import {
  Card,
  Table,
  Button,
  Tooltip,
  TableBody,
  Container,
  IconButton,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TablePagination,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Stack,
  Chip,
  Backdrop,
  CircularProgress,
  Alert,
  DialogContentText,
} from '@mui/material';

// @mui/icons-material
import { Add, Edit, Delete, Visibility, Send } from '@mui/icons-material';

// components
import Label from 'src/components/label';
import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';

// api
import {
  createEmailTemplate,
  getEmailTemplates,
  updateEmailTemplate,
  deleteEmailTemplate,
  testEmailTemplate,
  getEmailTemplateTypes,
} from 'src/api/emailTemplates';

// context
import { useAuth } from 'src/context/AuthContext';

export default function EmailTemplatesView() {
  const { user, token } = useAuth();
  
  // Custom styles for ReactQuill to match Material-UI
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .ql-container {
        border: none !important;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
        background: #fff;
        font-family: inherit;
      }
      .ql-toolbar {
        border: none !important;
        border-top: 1px solid #ddd !important;
        border-bottom: 1px solid #ddd !important;
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        background: #f8f9fa;
        padding: 8px;
      }
      .ql-editor {
        min-height: 180px;
        font-family: inherit;
        font-size: 14px;
        line-height: 1.5;
        padding: 12px;
      }
      .ql-editor p {
        margin-bottom: 0.8em;
      }
      .ql-editor h1, .ql-editor h2, .ql-editor h3 {
        margin-bottom: 0.5em;
        margin-top: 1em;
      }
      .ql-editor.ql-blank::before {
        color: #999;
        font-style: italic;
        font-size: 14px;
      }
      .ql-snow .ql-tooltip {
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const [templates, setTemplates] = useState([]);
  const [templateTypes, setTemplateTypes] = useState(['Welcome', 'Subscription', 'Reminder', 'Notification', 'Marketing']);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openTestModal, setOpenTestModal] = useState(false);
  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterName, setFilterName] = useState('');
  const [filterType, setFilterType] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    subject: '',
    content: '<p>Start writing your email content here...</p>',
    description: '',
    isActive: false,
  });

  const [formErrors, setFormErrors] = useState({});

  // Available variables for insertion
  const availableVariables = [
    '{{user_name}}',
    '{{user_email}}',
    '{{company_name}}',
    '{{current_date}}',
    '{{event_name}}',
    '{{location}}',
    '{{time}}',
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await getEmailTemplates({
        search: filterName,
        type: filterType,
        page: page + 1,
        limit: rowsPerPage,
      });
      
      // Ensure we always set an array
      let templatesData = [];
      if (response && response.templates) {
        templatesData = Array.isArray(response.templates) ? response.templates : [];
      } else if (response && response.data) {
        templatesData = Array.isArray(response.data) ? response.data : [];
      } else if (response && Array.isArray(response)) {
        templatesData = response;
      }
      
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error fetching templates:', error);
      // Set sample data for testing
              setTemplates([
          {
            id: 1,
            title: 'Welcome Email',
            type: 'Welcome',
            subject: 'Welcome to our platform!',
            content: '<p>Welcome to our platform! We are excited to have you on board.</p>',
            description: 'A welcome email for new users',
            isActive: true,
            updatedAt: new Date().toISOString(),
          },
          {
            id: 2,
            title: 'Subscription Reminder',
            type: 'Reminder',
            subject: 'Your subscription is expiring soon',
            content: '<p>Your subscription will expire in 3 days. Please renew to continue using our services.</p>',
            description: 'Reminder for subscription renewal',
            isActive: false,
            updatedAt: new Date().toISOString(),
          },
        ]);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleFilterByType = (event) => {
    setPage(0);
    setFilterType(event.target.value);
  };

  const handleOpenModal = (template = null) => {
    if (template) {
      setSelectedTemplate(template);
      setIsEdit(true);
      setFormData({
        title: template.title || '',
        type: template.type || '',
        subject: template.subject || '',
        content: template.content || '',
        description: template.description || '',
        isActive: template.isActive !== undefined ? template.isActive : false,
      });
    } else {
      setSelectedTemplate(null);
      setIsEdit(false);
      setFormData({
        title: '',
        type: '',
        subject: '',
        content: '',
        description: '',
        isActive: false,
      });
    }
    setFormErrors({});
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: '',
      subject: '',
      content: '<p>Start writing your email content here...</p>',
      description: '',
      isActive: false,
    });
    setFormErrors({});
    setSelectedTemplate(null);
    setIsEdit(false);
  };

  // Check if title already exists (case-insensitive)
  const isTitleDuplicate = (title) => {
    if (!templates || !Array.isArray(templates)) return false;
    
    const normalizedTitle = title.trim().toLowerCase();
    return templates.some(template => {
      // Skip the current template being edited
      if (isEdit && selectedTemplate && template.id === selectedTemplate.id) {
        return false;
      }
      return template.title.trim().toLowerCase() === normalizedTitle;
    });
  };

  const validateForm = () => {
    const errors = {};
    
    // Title validation
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (isTitleDuplicate(formData.title)) {
      errors.title = 'Title must be unique. Please choose another.';
    }
    
    if (!formData.type) errors.type = 'Type is required';
    if (!formData.subject.trim()) errors.subject = 'Subject is required';
    if (!formData.content.trim()) errors.content = 'Content is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Check authentication
    if (!token) {
      toast.error('You must be logged in to perform this action');
      return;
    }



    try {
      setIsSubmitting(true);
      
      // Clean form data and ensure only required fields are sent
      const { status, ...cleanFormData } = formData;
      const apiData = { ...cleanFormData };
      
      if (isEdit) {
        await updateEmailTemplate(selectedTemplate.id, apiData);
        toast.success('Template updated successfully');
      } else {
        await createEmailTemplate(apiData);
        toast.success('Template created successfully');
      }
      
      setOpenModal(false);
      resetForm();
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else {
        toast.error(`Failed to ${isEdit ? 'update' : 'create'} template`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    // Check authentication
    if (!token) {
      toast.error('You must be logged in to perform this action');
      return;
    }

    try {
      await deleteEmailTemplate(selectedTemplate.id);
      toast.success('Template deleted successfully');
      setOpenDeleteModal(false);
      setSelectedTemplate(null);
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else {
        toast.error('Failed to delete template');
      }
    }
  };

  const handleTestTemplate = async () => {
    // Check authentication
    if (!token) {
      toast.error('You must be logged in to perform this action');
      return;
    }

    try {
      const testEmail = document.getElementById('test-email').value;
      if (!testEmail) {
        toast.error('Please enter a test email address');
        return;
      }

      await testEmailTemplate(selectedTemplate.id, { email: testEmail });
      toast.success('Test email sent successfully');
      setOpenTestModal(false);
    } catch (error) {
      console.error('Error sending test email:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else {
        toast.error('Failed to send test email');
      }
    }
  };

  const handlePreviewTemplate = (template) => {
    setSelectedTemplate(template);
    setOpenPreviewModal(true);
  };

  const insertVariable = (variable) => {
    // Get the Quill instance from the ReactQuill component
    const quillEditor = document.querySelector('.ql-editor');
    if (quillEditor) {
      const quill = quillEditor.__quill;
      if (quill) {
        const range = quill.getSelection();
        if (range) {
          quill.insertText(range.index, variable);
        } else {
          quill.insertText(quill.getLength(), variable);
        }
        // Focus back to the editor
        quill.focus();
      }
    }
  };

  // Function to handle content change with better validation
  const handleContentChange = (content) => {
    // Ensure content is never empty
    if (!content || content === '<p><br></p>' || content === '<p></p>') {
      setFormData({ ...formData, content: '<p>Start writing your email content here...</p>' });
    } else {
      setFormData({ ...formData, content });
    }
  };

  const getStatusColor = (status) => {
    if (typeof status === 'boolean') {
      return status ? 'success' : 'warning';
    }
    
    switch (status) {
      case 'active':
      case true:
        return 'success';
      case 'draft':
      case false:
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (template) => {
    if (template.isActive !== undefined) {
      return template.isActive ? 'Active' : 'Inactive';
    }
    if (template.status !== undefined) {
      return template.status;
    }
    return 'Unknown';
  };

  const filteredTemplates = Array.isArray(templates) ? templates.filter((template) => {
    const matchesName = template.title.toLowerCase().includes(filterName.toLowerCase()) ||
                       template.subject.toLowerCase().includes(filterName.toLowerCase());
    const matchesType = !filterType || template.type === filterType;
    return matchesName && matchesType;
  }) : [];

  const paginatedTemplates = filteredTemplates.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      <Helmet>
        <title> Email Templates | Minimal UI </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Email Templates
          </Typography>
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={() => handleOpenModal()}
          >
            New Template
          </Button>
        </Stack>

        <Card>
          {/* Search and Filter */}
          <Box
            sx={{
              gap: 2,
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              },
              p: 2.5,
            }}
          >
            <TextField
              fullWidth
              value={filterName}
              onChange={handleFilterByName}
              placeholder="Search by title or subject..."
            />

            <FormControl fullWidth>
              <InputLabel>Filter by Type</InputLabel>
              <Select
                value={filterType}
                label="Filter by Type"
                onChange={handleFilterByType}
              >
                <MenuItem value="">All Types</MenuItem>
                {templateTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Updated</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedTemplates.map((template) => (
                    <TableRow key={template.id} hover>
                      <TableCell>
                        <Typography variant="body2">{template.title}</Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={template.type}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200 }}>
                          {template.subject}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Label
                          variant="soft"
                          color={getStatusColor(template.isActive !== undefined ? template.isActive : template.status)}
                          sx={{ textTransform: 'capitalize' }}
                        >
                          {getStatusLabel(template)}
                        </Label>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {new Date(template.updatedAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          {/* <Tooltip title="Preview">
                            <IconButton size="small" onClick={() => handlePreviewTemplate(template)}>
                              <Visibility />
                            </IconButton>
                          </Tooltip> */}

                          {/* <Tooltip title="Test">
                            <IconButton size="small" onClick={() => {
                              setSelectedTemplate(template);
                              setOpenTestModal(true);
                            }}>
                              <Send />
                            </IconButton>
                          </Tooltip> */}

                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleOpenModal(template)}>
                              <Edit />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => {
                              setSelectedTemplate(template);
                              setOpenDeleteModal(true);
                            }} color="error">
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}

                  {paginatedTemplates.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ py: 3 }}>
                        <Alert severity="info">No templates found</Alert>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredTemplates.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>

      {/* Create/Edit Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEdit ? 'Edit Email Template' : 'Create New Email Template'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => {
                const newTitle = e.target.value;
                setFormData({ ...formData, title: newTitle });
                
                // Clear title error if it was previously showing
                if (formErrors.title) {
                  setFormErrors(prev => ({ ...prev, title: '' }));
                }
                
                // Real-time validation for title uniqueness
                if (newTitle.trim() && isTitleDuplicate(newTitle)) {
                  setFormErrors(prev => ({ 
                    ...prev, 
                    title: 'Title must be unique. Please choose another.' 
                  }));
                }
              }}
              onBlur={() => {
                // Validate title on blur
                if (formData.title.trim() && isTitleDuplicate(formData.title)) {
                  setFormErrors(prev => ({ 
                    ...prev, 
                    title: 'Title must be unique. Please choose another.' 
                  }));
                }
              }}
              error={!!formErrors.title}
              helperText={formErrors.title}
              required
            />

            <FormControl fullWidth error={!!formErrors.type}>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                label="Type"
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                {templateTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              error={!!formErrors.subject}
              helperText={formErrors.subject}
              required
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Content *
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Available variables:
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                  {availableVariables.map((variable) => (
                    <Chip
                      key={variable}
                      label={variable}
                      size="small"
                      onClick={() => insertVariable(variable)}
                      sx={{ cursor: 'pointer', mb: 1 }}
                    />
                  ))}
                </Stack>
              </Box>
              <Box sx={{ border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={handleContentChange}
                  style={{ 
                    height: '250px',
                    fontSize: '14px'
                  }}
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      [{ 'color': [] }, { 'background': [] }],
                      [{ 'align': [] }],
                      ['link', 'image'],
                      ['clean']
                    ]
                  }}
                  placeholder="Start typing your email content here..."
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Note: The editor will generate HTML code that will be used in the email template.
              </Typography>
              {formErrors.content && (
                <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                  {formErrors.content}
                </Typography>
              )}
            </Box>

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.isActive}
                label="Status"
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value })}
              >
                <MenuItem value={false}>Draft</MenuItem>
                <MenuItem value={true}>Active</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <DialogTitle>Delete Template</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this email template?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteModal(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Test Template Modal */}
      <Dialog open={openTestModal} onClose={() => setOpenTestModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Test Template</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Send to Email"
              id="test-email"
              placeholder="Enter email address to send test"
              type="email"
            />
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Preview:
              </Typography>
              <Box
                sx={{
                  border: '1px solid #ddd',
                  borderRadius: 1,
                  p: 2,
                  minHeight: '200px',
                  bgcolor: '#f9f9f9',
                }}
                dangerouslySetInnerHTML={{
                  __html: selectedTemplate?.content || '',
                }}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTestModal(false)}>Cancel</Button>
          <Button onClick={handleTestTemplate} variant="contained" startIcon={<Send />}>
            Send Test Email
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={openPreviewModal} onClose={() => setOpenPreviewModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Template Preview</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Title:
              </Typography>
              <Typography variant="body1">{selectedTemplate?.title}</Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Type:
              </Typography>
              <Typography variant="body1">{selectedTemplate?.type}</Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Subject:
              </Typography>
              <Typography variant="body1">{selectedTemplate?.subject}</Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Content:
              </Typography>
              <Box
                sx={{
                  border: '1px solid #ddd',
                  borderRadius: 1,
                  p: 2,
                  minHeight: '200px',
                  bgcolor: '#f9f9f9',
                }}
                dangerouslySetInnerHTML={{
                  __html: selectedTemplate?.content || '',
                }}
              />
            </Box>
            
            {selectedTemplate?.description && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Description:
                </Typography>
                <Typography variant="body1">{selectedTemplate.description}</Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreviewModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Loading Backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isSubmitting}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}
