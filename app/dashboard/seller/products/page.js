'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import ProductForm from '../../../../components/ProductForm'; // Using the detailed form

const API_URL = 'http://localhost:8000/user/store/products/';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    setIsLoading(true);
    axios.get(API_URL, { headers: { Authorization: `Token ${token}` } })
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        console.error('Failed to fetch products:', error);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    const token = localStorage.getItem('accessToken');
    try {
      await axios.delete(`${API_URL}${productId}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      fetchProducts(); // Refresh the list after deleting
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Error deleting product.');
    }
  };

  const handleOpenModal = (product = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };
  
  const handleFormSubmit = () => {
    handleCloseModal();
    fetchProducts();
  };
  
  // Helper to display the sale type nicely
  const formatSaleType = (type) => {
    const types = {
      'BOTH': 'Online & In-Store',
      'OFFLINE': 'In-Store Only',
      'ONLINE': 'Online Only'
    };
    return types[type] || type;
  };

  if (isLoading) return <p>Loading products...</p>;

  return (
    <div>
      <div style={styles.header}>
        <h1>My Products</h1>
        <button onClick={() => handleOpenModal()} style={styles.buttonPrimary}>+ Add Product</button>
      </div>

      {isModalOpen && (
        <ProductForm
          product={editingProduct}
          onClose={handleCloseModal}
          onSuccess={handleFormSubmit}
        />
      )}

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Product</th>
            <th style={styles.th}>Price</th>
            <th style={styles.th}>Stock (Online / Total)</th>
            <th style={styles.th}>Sale Type</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? products.map(product => (
            <tr key={product.id}>
              <td style={styles.td}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <img src={product.image_url || '/placeholder.png'} alt={product.name} width="60" height="60" style={styles.image} />
                    <div>
                        <strong>{product.name}</strong><br/>
                        <small>{product.model_name}</small>
                    </div>
                </div>
              </td>
              <td style={styles.td}>₹{product.price}</td>
              <td style={styles.td}>{product.online_stock} / {product.total_stock}</td>
              <td style={styles.td}>{formatSaleType(product.sale_type)}</td>
              <td style={styles.td}>
                <button onClick={() => handleOpenModal(product)} style={styles.buttonSecondary}>Edit</button>
                <button onClick={() => handleDelete(product.id)} style={styles.buttonDanger}>Delete</button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="5" style={{...styles.td, textAlign: 'center', padding: '2rem'}}>No products found. Add your first product!</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
    buttonPrimary: { padding: '10px 20px', backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    buttonSecondary: { padding: '8px 12px', marginRight: '5px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    buttonDanger: { padding: '8px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { borderBottom: '2px solid #dee2e6', padding: '12px', textAlign: 'left', backgroundColor: '#f8f9fa' },
    td: { borderBottom: '1px solid #dee2e6', padding: '12px', verticalAlign: 'middle' },
    image: { objectFit: 'cover', borderRadius: '4px', marginRight: '15px' }
};