'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import QuickAddStockForm from '../../../../components/QuickAddStockForm';
import Link from 'next/link';

const API_URL = 'http://localhost:8000/user/store/products/';

// Confirmation Modal Component (this part is correct)
function ConfirmationModal({ message, onConfirm, onCancel }) {
  const [note, setNote] = useState('');
  const handleConfirmClick = () => { onConfirm(note); };
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h4>Confirm Stock Change</h4>
        <p>{message}</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Reason for change (e.g., weekly restock, sale, correction)"
          style={styles.textarea}
        />
        <div style={styles.buttonContainer}>
          <button onClick={onCancel} style={styles.buttonSecondary}>Cancel</button>
          <button onClick={handleConfirmClick} style={styles.buttonPrimary}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

export default function StockManagementPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmation, setConfirmation] = useState(null);

  const fetchData = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    const url = searchTerm ? `${API_URL}?search=${searchTerm}` : API_URL;
    axios.get(url, { headers: { Authorization: `Token ${token}` } })
      .then(response => setProducts(response.data))
      .catch(error => console.error('Failed to fetch products:', error))
      .finally(() => setIsLoading(false));
  }, [searchTerm]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStockChange = (productId, stockType, newStock) => {
    const stockValue = Math.max(0, parseInt(newStock, 10));
    if (isNaN(stockValue)) return;
    setConfirmation({
      message: `Are you sure you want to set the ${stockType.replace('_', ' ')} to ${stockValue}?`,
      onConfirm: (note) => {
        const token = localStorage.getItem('accessToken');
        const data = { [stockType]: stockValue, note: note };
        axios.patch(`${API_URL}${productId}/update-stock/`, data, {
          headers: { Authorization: `Token ${token}` }
        })
        .then(() => fetchData())
        .catch(error => {
          alert(error.response?.data?.error || 'Could not update stock.');
          fetchData();
        })
        .finally(() => setConfirmation(null));
      },
      onCancel: () => setConfirmation(null)
    });
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleFormSubmit = () => { handleCloseModal(); fetchData(); };

  return (
    <div>
      {confirmation && <ConfirmationModal {...confirmation} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Stock Management</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/dashboard/seller/history" style={styles.buttonSecondary}>View History</Link>
          <button onClick={handleOpenModal} style={styles.buttonPrimary}>+ Quick Add Product</button>
        </div>
      </div>
      <p>Manage inventory and add new items to your store.</p>
      <div style={styles.searchContainer}><input type="text" placeholder="Search by product name or model..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput}/></div>
      {isModalOpen && <QuickAddStockForm onClose={handleCloseModal} onSuccess={handleFormSubmit} />}

      {/* ✅ START: Add this full table back */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Product</th>
            <th style={{...styles.th, textAlign: 'center'}}>Total Stock</th>
            <th style={{...styles.th, textAlign: 'center'}}>Online Stock</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan="3" style={{...styles.td, textAlign: 'center'}}>Loading...</td></tr>
          ) : products.length > 0 ? products.map(product => (
            <tr key={product.id}>
              <td style={styles.td}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <img src={product.image_url || '/placeholder.png'} alt={product.name} width="50" height="50" style={{ objectFit: 'cover', borderRadius: '4px', marginRight: '15px' }} />
                  <div><strong>{product.name}</strong><br/><small>{product.model_name}</small></div>
                </div>
              </td>
              <td style={{...styles.td, textAlign: 'center'}}>
                <div style={styles.stockControl}>
                  <button onClick={() => handleStockChange(product.id, 'total_stock', product.total_stock - 1)} style={styles.stockButton}>-</button>
                  <input type="number" value={product.total_stock} onChange={(e) => handleStockChange(product.id, 'total_stock', e.target.value)} style={styles.stockInput} />
                  <button onClick={() => handleStockChange(product.id, 'total_stock', product.total_stock + 1)} style={styles.stockButton}>+</button>
                </div>
              </td>
              <td style={{...styles.td, textAlign: 'center'}}>
                <div style={styles.stockControl}>
                  <button onClick={() => handleStockChange(product.id, 'online_stock', product.online_stock - 1)} style={styles.stockButton}>-</button>
                  <input type="number" value={product.online_stock} onChange={(e) => handleStockChange(product.id, 'online_stock', e.target.value)} style={styles.stockInput} />
                  <button onClick={() => handleStockChange(product.id, 'online_stock', product.online_stock + 1)} style={styles.stockButton}>+</button>
                </div>
              </td>
            </tr>
          )) : (
            <tr><td colSpan="3" style={{...styles.td, textAlign: 'center', padding: '2rem'}}>No products found.</td></tr>
          )}
        </tbody>
      </table>
      {/* ✅ END: Add this full table back */}
    </div>
  );
}

const styles = {
    buttonPrimary: { padding: '10px 20px', backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem' },
    buttonSecondary: { padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '1.5rem' },
    th: { borderBottom: '2px solid #dee2e6', padding: '12px', textAlign: 'left', backgroundColor: '#f8f9fa' },
    td: { borderBottom: '1px solid #dee2e6', padding: '12px', verticalAlign: 'middle' },
    stockControl: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
    stockInput: { width: '70px', textAlign: 'center', margin: '0 8px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem' },
    stockButton: { width: '35px', height: '35px', border: '1px solid #ccc', borderRadius: '50%', cursor: 'pointer', backgroundColor: '#fff', fontSize: '1.2rem', lineHeight: '1' },
    searchContainer: { margin: '1.5rem 0 0.5rem' },
    searchInput: { width: '100%', padding: '12px', fontSize: '1rem', border: '1px solid #ccc', borderRadius: '5px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { background: 'white', padding: '2rem', borderRadius: '8px', width: '400px', maxWidth: '90%', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' },
    textarea: { width: '100%', padding: '8px', minHeight: '60px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px', marginTop: '1rem' },
    buttonContainer: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' },
};