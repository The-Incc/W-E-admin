import axiosInstance from './axiosInstance';

// Create template
export const createEmailTemplate = async (templateData) => {
  const response = await axiosInstance.post('/admin/email-templates', templateData);
  return response.data;
};

// Get all templates with filters
export const getEmailTemplates = async (filters = {}) => {
  const response = await axiosInstance.get('/admin/email-templates', { params: filters });
  return response.data;
};

// Get single template
export const getEmailTemplate = async (id) => {
  const response = await axiosInstance.get(`/admin/email-templates/${id}`);
  return response.data;
};

// Update template
export const updateEmailTemplate = async (id, templateData) => {
  const response = await axiosInstance.put(`/admin/email-templates/${id}`, templateData);
  return response.data;
};

// Delete template
export const deleteEmailTemplate = async (id) => {
  const response = await axiosInstance.delete(`/admin/email-templates/${id}/?permanent=true`);
  return response.data;
};

// Test template
export const testEmailTemplate = async (id, testData) => {
  const response = await axiosInstance.post(`/admin/email-templates/${id}/test`, testData);
  return response.data;
};

// Get template types
export const getEmailTemplateTypes = async () => {
  const response = await axiosInstance.get('/admin/email-templates/types');
  return response.data;
};

// Upload image for email template
export const uploadEmailTemplateImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await axiosInstance.post('/admin/email-templates/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

