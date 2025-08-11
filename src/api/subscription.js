import axiosInstance from './axiosInstance';

export const fetchSubscriptions = async () => {
  const response = await axiosInstance.get('/subscribes');
  return response.data;
};