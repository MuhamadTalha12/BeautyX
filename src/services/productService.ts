import api from './api';
import { CATEGORIES } from '../data/mockData';

export const getProducts = async (params: any = {}) => {
  return api.get('/products', { params });
};

export const getProductBySlug = async (slug: string) => {
  return api.get(`/products/${slug}`);
};

export const getCategories = async () => {
  return { data: { data: { categories: CATEGORIES } } };
};

export const getFeatured = async () => {
  return api.get('/products', { params: { featured: true, limit: 8 } });
};

export const getBestSellers = async () => {
  return api.get('/products', { params: { bestSeller: true, limit: 8 } });
};

export const getNewArrivals = async () => {
  return api.get('/products', { params: { newArrival: true, limit: 8 } });
};

export const createProduct = async (data: any) => {
  return api.post('/products', data);
};

export const updateProduct = async (id: string, data: any) => {
  return api.put(`/products/${id}`, data);
};

export const deleteProduct = async (id: string) => {
  return api.delete(`/products/${id}`);
};

export const createProductReview = async (productId: string, rating: number, comment: string) => {
  return api.post(`/products/${productId}/reviews`, { rating, comment });
};

