import { api } from '../../api/client';

export const listSales = () => api.get('/sales');
export const getSale = (id) => api.get(`/sales/${id}`);
export const createSale = (body) => api.post('/sales', body);
