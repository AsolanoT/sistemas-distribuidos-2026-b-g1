import { api } from '../../api/client';

export const listCustomers = () => api.get('/customers');
export const listActiveCustomers = () => api.get('/customers?active=true');
export const createCustomer = (body) => api.post('/customers', body);
export const updateCustomer = (id, body) => api.put(`/customers/${id}`, body);
export const deactivateCustomer = (id) => api.patch(`/customers/${id}/deactivate`);
