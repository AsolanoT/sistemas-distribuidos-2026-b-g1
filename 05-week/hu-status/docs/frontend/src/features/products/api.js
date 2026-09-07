import { api } from '../../api/client';

export const listProducts = () => api.get('/products');
export const listActiveProducts = () => api.get('/products?active=true');
export const createProduct = (body) => api.post('/products', body);
export const updateProduct = (id, body) => api.put(`/products/${id}`, body);
export const deactivateProduct = (id) => api.patch(`/products/${id}/deactivate`);

export const listCategories = () => api.get('/categories');
export const listActiveCategories = () => api.get('/categories?active=true');
export const createCategory = (body) => api.post('/categories', body);
