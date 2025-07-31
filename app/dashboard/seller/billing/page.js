'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

const PRODUCTS_API_URL = 'http://localhost:8000/user/store/products/';
const CREATE_ORDER_URL = 'http://localhost:8000/user/orders/create-local-order/';

export default function BillingPage() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [billItems, setBillItems] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch all products for the search/selection list
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    const url = searchTerm ? `${PRODUCTS_API_URL}?search=${searchTerm}` : PRODUCTS_API_URL;
    axios.get(url, { headers: { Authorization: `Token ${token}` } })
      .then(response => setProducts(response.data))
      .catch(error => console.error('Failed to fetch products:', error));
  }, [searchTerm]);

  const addToBill = (product) => {
    setBillItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };
  
  const updateQuantity = (productId, quantity) => {
    const newQty = Math.max(1, parseInt(quantity, 10));
    setBillItems(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity: newQty } : item
    ));
  };
  
  const removeFromBill = (productId) => {
    setBillItems(prev => prev.filter(item => item.id !== productId));
  };
  
  const calculateTotal = () => {
    return billItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const handleGenerateBill = () => {
    if (billItems.length === 0) {
      alert("Please add items to the bill.");
      return;
    }
    setIsProcessing(true);
    const token = localStorage.getItem('accessToken');
    
    const orderData = {
      customer_name: customer.name || 'Local Customer',
      customer_phone: customer.phone,
      items: billItems.map(item => ({ id: item.id, quantity: item.quantity })),
    };

    axios.post(CREATE_ORDER_URL, orderData, { headers: { Authorization: `Token ${token}` } })
      .then(response => {
        const orderId = response.data.order_id;
        // Open the printable bill in a new tab
        window.open(`http://localhost:8000/user/orders/${orderId}/generate-bill/`);
        // Reset the form
        setBillItems([]);
        setCustomer({ name: '', phone: '' });
      })
      .catch(error => alert(`Error: ${error.response?.data?.error || 'Could not create bill.'}`))
      .finally(() => setIsProcessing(false));
  };

  return (
    <div>
      <h1>Local Billing</h1>
      <div style={styles.billingLayout}>
        {/* Left Side: Product Selection */}
        <div style={styles.productSelection}>
          <h3>Add Products</h3>
          <input type="text" placeholder="Search products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={styles.searchInput}/>
          <div style={styles.productList}>
            {products.map(product => (
              <div key={product.id} onClick={() => addToBill(product)} style={styles.productItem}>
                {product.name} ({product.model_name}) - ₹{product.price}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Current Bill */}
        <div style={styles.currentBill}>
          <h3>Current Bill</h3>
          <div style={styles.customerDetails}>
            <input type="text" placeholder="Customer Name (Optional)" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} style={styles.input}/>
            <input type="text" placeholder="Customer Phone (Optional)" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} style={styles.input}/>
          </div>
          <table style={styles.table}>
            <tbody>
              {billItems.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td><input type="number" value={item.quantity} onChange={e => updateQuantity(item.id, e.target.value)} style={{width: '50px'}}/></td>
                  <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                  <td><button onClick={() => removeFromBill(item.id)} style={{color: 'red'}}>×</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={styles.billTotal}>
            <strong>Total: ₹{calculateTotal()}</strong>
          </div>
          <button onClick={handleGenerateBill} disabled={isProcessing} style={styles.buttonPrimary}>
            {isProcessing ? 'Processing...' : 'Generate Bill'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
    billingLayout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '1.5rem' },
    productSelection: { border: '1px solid #dee2e6', borderRadius: '8px', padding: '20px' },
    currentBill: { border: '1px solid #dee2e6', borderRadius: '8px', padding: '20px' },
    searchInput: { width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' },
    productList: { maxHeight: '400px', overflowY: 'auto' },
    productItem: { padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee' },
    customerDetails: { marginBottom: '1rem', display: 'flex', gap: '10px' },
    input: { flex: 1, padding: '8px' },
    table: { width: '100%' },
    billTotal: { textAlign: 'right', fontSize: '1.2rem', margin: '1rem 0' },
    buttonPrimary: { width: '100%', padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1.1rem' },
};