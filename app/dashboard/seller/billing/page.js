'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { 
  Search, 
  Plus, 
  Minus, 
  X, 
  ShoppingCart, 
  User, 
  Phone, 
  Receipt,
  Package,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

// ✅ Using environment variables for API URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const PRODUCTS_API_URL = `${API_BASE_URL}/user/store/products/`;
const CREATE_ORDER_URL = `${API_BASE_URL}/user/orders/create-order/`;

export default function BillingPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [billItems, setBillItems] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ✅ FIXED: Changed Token to Bearer authentication
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error("Seller is not authenticated.");
      setError("Please log in to access billing features.");
      return null;
    }
    return { 'Authorization': `Bearer ${token}` };
  }, []);

  // Fetch products on component mount
  const fetchProducts = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    setIsLoading(true);
    setError('');

    try {
      console.log('Fetching products from:', PRODUCTS_API_URL);
      const response = await axios.get(PRODUCTS_API_URL, { headers });
      const productData = response.data.results || response.data || [];
      
      console.log('Products fetched:', productData.length);
      setProducts(productData);
      setFilteredProducts(productData);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
        // Optionally redirect to login
        // window.location.href = '/login/seller';
      } else {
        setError('Failed to load products. Please refresh the page.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  // Filter products based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.model_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addToBill = (product) => {
    // ✅ FIXED: Check total_stock instead of online_stock for local billing
    if (product.total_stock <= 0) {
      setError(`${product.name} is out of stock`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    setBillItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        const newQuantity = existingItem.quantity + 1;
        // ✅ FIXED: Check against total_stock for local billing
        if (newQuantity > product.total_stock) {
          setError(`Only ${product.total_stock} units available for ${product.name}`);
          setTimeout(() => setError(''), 3000);
          return prev;
        }
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    // Show success feedback
    setSuccess(`Added ${product.name} to bill`);
    setTimeout(() => setSuccess(''), 2000);
  };
  
  const updateQuantity = (productId, quantity) => {
    const newQty = Math.max(1, parseInt(quantity, 10) || 1);
    const product = products.find(p => p.id === productId);
    
    // ✅ FIXED: Check against total_stock for local billing
    if (product && newQty > product.total_stock) {
      setError(`Only ${product.total_stock} units available for ${product.name}`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    setBillItems(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity: newQty } : item
    ));
  };
  
  const removeFromBill = (productId) => {
    setBillItems(prev => prev.filter(item => item.id !== productId));
  };
  
  const calculateTotal = () => {
    return billItems.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  };

  const validateCustomerInfo = () => {
    if (customer.phone && customer.phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    return true;
  };

  const handleGenerateBill = async () => {
    if (billItems.length === 0) {
      setError("Please add items to the bill.");
      return;
    }

    if (!validateCustomerInfo()) {
      return;
    }

    setIsProcessing(true);
    setError('');
    
    const headers = getAuthHeaders();
    if (!headers) {
        setError("Authentication error. Please log in again.");
        setIsProcessing(false);
        return;
    }
    
    try {
      // ✅ FIXED: Correct order data for local billing
      const orderData = {
        customer_name: customer.name || 'Local Customer',
        customer_phone: customer.phone || 'N/A',
        items: billItems.map(item => ({ 
          id: item.id, 
          quantity: item.quantity,
          price: item.price 
        })),
        payment_method: 'COD', // ✅ FIXED: Use 'COD' instead of 'CASH'
        // ✅ REMOVED: order_type - let backend set it automatically based on user type
      };

      console.log('Creating local bill order:', orderData);
      const orderResponse = await axios.post(CREATE_ORDER_URL, orderData, { headers });
      const orderId = orderResponse.data.order_id;

      console.log('✅ Local bill created with ID:', orderId);
      console.log('Order type should be LOCAL for seller-created orders');

      // Generate and open bill
      const billUrl = `${API_BASE_URL}/user/orders/${orderId}/generate-bill/`;
      const billResponse = await axios.get(billUrl, {
        headers: headers,
        responseType: 'blob',
      });

      // Create and open bill in new tab
      const file = new Blob([billResponse.data], { type: 'text/html' });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, '_blank');
      
      // Reset form
      setBillItems([]);
      setCustomer({ name: '', phone: '' });
      setSuccess('Bill generated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
      // ✅ Refresh products to get updated stock
      fetchProducts();
      
    } catch (error) {
      console.error('Billing error:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        const errorMessage = error.response?.data?.error || 
                            error.response?.data?.message ||
                            'Could not create bill. Please try again.';
        setError(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const clearBill = () => {
    setBillItems([]);
    setCustomer({ name: '', phone: '' });
    setError('');
    setSuccess('Bill cleared');
    setTimeout(() => setSuccess(''), 2000);
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>
          <Receipt size={28} />
          Local Billing
        </h1>
        <p style={styles.pageSubtitle}>Create bills for walk-in customers</p>
      </div>

      {/* Status Messages */}
      {error && (
        <div style={styles.errorMessage}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div style={styles.successMessage}>
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      <div style={styles.billingLayout}>
        {/* Product Selection */}
        <div style={styles.productSelection}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>
              <Package size={20} />
              Add Products
            </h3>
          </div>
          
          <div style={styles.searchContainer}>
            <Search size={18} style={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search products by name or model..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              style={styles.searchInput}
            />
          </div>
          
          <div style={styles.productList}>
            {isLoading ? (
              <div style={styles.loadingProducts}>
                <div style={styles.spinner}></div>
                <p>Loading products...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <div 
                  key={product.id} 
                  onClick={() => addToBill(product)} 
                  style={{
                    ...styles.productItem,
                    // ✅ FIXED: Check total_stock for local billing
                    ...(product.total_stock <= 0 ? styles.outOfStock : {})
                  }}
                >
                  <div style={styles.productInfo}>
                    <div style={styles.productName}>
                      {product.name}
                      {product.model_name && (
                        <span style={styles.productModel}>({product.model_name})</span>
                      )}
                    </div>
                    <div style={styles.productPrice}>₹{parseFloat(product.price).toFixed(2)}</div>
                    <div style={styles.productStock}>
                      {/* ✅ FIXED: Show total_stock for local billing */}
                      Total Stock: {product.total_stock || 0}
                      {product.online_stock !== undefined && (
                        <span style={styles.onlineStock}> | Online: {product.online_stock}</span>
                      )}
                    </div>
                  </div>
                  <div style={styles.addButton}>
                    <Plus size={16} />
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.noProducts}>
                <Package size={32} />
                <p>No products found</p>
              </div>
            )}
          </div>
        </div>

        {/* Current Bill */}
        <div style={styles.currentBill}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>
              <ShoppingCart size={20} />
              Current Bill
            </h3>
            {billItems.length > 0 && (
              <button onClick={clearBill} style={styles.clearButton}>
                Clear All
              </button>
            )}
          </div>
          
          <div style={styles.customerDetails}>
            <div style={styles.inputGroup}>
              <User size={16} style={styles.inputIcon} />
              <input 
                type="text" 
                placeholder="Customer Name (Optional)" 
                value={customer.name} 
                onChange={e => setCustomer({...customer, name: e.target.value})} 
                style={styles.customerInput}
              />
            </div>
            <div style={styles.inputGroup}>
              <Phone size={16} style={styles.inputIcon} />
              <input 
                type="tel" 
                placeholder="Phone Number (Optional)" 
                value={customer.phone} 
                onChange={e => setCustomer({...customer, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} 
                style={styles.customerInput}
                maxLength={10}
              />
            </div>
          </div>
          
          <div style={styles.billItemsContainer}>
            {billItems.length > 0 ? (
              <table style={styles.billTable}>
                <thead>
                  <tr style={styles.billTableHeader}>
                    <th style={styles.billTableHeaderCell}>Item</th>
                    <th style={styles.billTableHeaderCell}>Qty</th>
                    <th style={styles.billTableHeaderCell}>Price</th>
                    <th style={styles.billTableHeaderCell}>Total</th>
                    <th style={styles.billTableHeaderCell}></th>
                  </tr>
                </thead>
                <tbody>
                  {billItems.map(item => (
                    <tr key={item.id} style={styles.billTableRow}>
                      <td style={styles.billTableCell}>
                        <div style={styles.billItemName}>{item.name}</div>
                        {item.model_name && (
                          <div style={styles.billItemModel}>{item.model_name}</div>
                        )}
                      </td>
                      <td style={styles.billTableCell}>
                        <div style={styles.quantityContainer}>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            style={styles.quantityButton}
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={12} />
                          </button>
                          <input 
                            type="number" 
                            value={item.quantity} 
                            onChange={e => updateQuantity(item.id, e.target.value)} 
                            style={styles.quantityInput}
                            min={1}
                            max={item.total_stock} // ✅ FIXED: Use total_stock
                          />
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            style={styles.quantityButton}
                            disabled={item.quantity >= item.total_stock} // ✅ FIXED: Use total_stock
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </td>
                      <td style={styles.billTableCell}>₹{parseFloat(item.price).toFixed(2)}</td>
                      <td style={styles.billTableCell}>
                        <strong>₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</strong>
                      </td>
                      <td style={styles.billTableCell}>
                        <button 
                          onClick={() => removeFromBill(item.id)} 
                          style={styles.removeButton}
                          title="Remove item"
                        >
                          <X size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={styles.emptyBill}>
                <ShoppingCart size={32} />
                <p>No items in bill</p>
                <p style={styles.emptyBillHint}>Click on products to add them to the bill</p>
              </div>
            )}
          </div>
          
          {billItems.length > 0 && (
            <>
              <div style={styles.billSummary}>
                <div style={styles.billTotal}>
                  <span>Total: </span>
                  <strong>₹{calculateTotal().toFixed(2)}</strong>
                </div>
                <div style={styles.billItems}>
                  {billItems.length} item{billItems.length !== 1 ? 's' : ''}
                </div>
                <div style={styles.billType}>
                  <small>📋 Local Bill (In-store purchase)</small>
                </div>
              </div>
              
              <button 
                onClick={handleGenerateBill} 
                disabled={isProcessing} 
                style={styles.generateButton}
              >
                {isProcessing ? (
                  <span style={styles.buttonContent}>
                    <div style={styles.spinner}></div>
                    Processing...
                  </span>
                ) : (
                  <span style={styles.buttonContent}>
                    <Receipt size={18} />
                    Generate Local Bill
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ✅ Updated styles with new additions
const styles = {
  pageContainer: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
    backgroundColor: '#f8fafc'
  },
  
  header: {
    marginBottom: '24px'
  },
  
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 8px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  
  pageSubtitle: {
    fontSize: '1rem',
    color: '#6b7280',
    margin: 0
  },
  
  errorMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#fef2f2',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    color: '#991b1b',
    marginBottom: '20px'
  },
  
  successMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #10b981',
    borderRadius: '8px',
    color: '#065f46',
    marginBottom: '20px'
  },
  
  billingLayout: { 
    display: 'grid', 
    gridTemplateColumns: '1fr 1fr', 
    gap: '24px'
  },
  
  productSelection: { 
    backgroundColor: 'white',
    borderRadius: '12px', 
    padding: '24px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  
  currentBill: { 
    backgroundColor: 'white',
    borderRadius: '12px', 
    padding: '24px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e5e7eb'
  },
  
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0
  },
  
  clearButton: {
    padding: '6px 12px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  
  searchContainer: {
    position: 'relative',
    marginBottom: '16px'
  },
  
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6b7280',
    zIndex: 1
  },
  
  searchInput: { 
    width: '100%', 
    padding: '12px 12px 12px 40px', 
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  
  productList: { 
    maxHeight: '500px', 
    overflowY: 'auto'
  },
  
  loadingProducts: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    gap: '12px',
    color: '#6b7280'
  },
  
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid #f3f3f3',
    borderTop: '2px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  
  productItem: { 
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px', 
    cursor: 'pointer', 
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    marginBottom: '8px',
    transition: 'all 0.2s ease',
    backgroundColor: 'white'
  },
  
  outOfStock: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  
  productInfo: {
    flex: 1
  },
  
  productName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: '4px'
  },
  
  productModel: {
    fontSize: '12px',
    color: '#6b7280',
    marginLeft: '6px'
  },
  
  productPrice: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#059669',
    marginBottom: '2px'
  },
  
  productStock: {
    fontSize: '12px',
    color: '#6b7280'
  },
  
  // ✅ NEW: Online stock indicator
  onlineStock: {
    fontSize: '11px',
    color: '#8b5cf6'
  },
  
  addButton: {
    width: '32px',
    height: '32px',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  noProducts: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    gap: '12px',
    color: '#6b7280'
  },
  
  customerDetails: { 
    marginBottom: '20px', 
    display: 'flex', 
    flexDirection: 'column',
    gap: '12px'
  },
  
  inputGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: '#6b7280',
    zIndex: 1
  },
  
  customerInput: { 
    width: '100%',
    padding: '12px 12px 12px 40px', 
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none'
  },
  
  billItemsContainer: {
    marginBottom: '20px'
  },
  
  billTable: { 
    width: '100%',
    borderCollapse: 'collapse'
  },
  
  billTableHeader: {
    backgroundColor: '#f8fafc'
  },
  
  billTableHeaderCell: {
    padding: '12px 8px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    borderBottom: '1px solid #e5e7eb'
  },
  
  billTableRow: {
    borderBottom: '1px solid #f3f4f6'
  },
  
  billTableCell: {
    padding: '12px 8px',
    fontSize: '14px',
    verticalAlign: 'middle'
  },
  
  billItemName: {
    fontWeight: '500',
    color: '#1f2937'
  },
  
  billItemModel: {
    fontSize: '12px',
    color: '#6b7280'
  },
  
  quantityContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  
  quantityButton: {
    width: '24px',
    height: '24px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  quantityInput: {
    width: '50px',
    padding: '4px',
    textAlign: 'center',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '12px'
  },
  
  removeButton: {
    color: '#ef4444',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  emptyBill: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    gap: '12px',
    color: '#6b7280',
    textAlign: 'center'
  },
  
  emptyBillHint: {
    fontSize: '14px',
    color: '#9ca3af',
    margin: 0
  },
  
  billSummary: {
    backgroundColor: '#f8fafc',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '16px',
    border: '1px solid #e2e8f0'
  },
  
  billTotal: { 
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '4px'
  },
  
  billItems: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '4px'
  },
  
  // ✅ NEW: Bill type indicator
  billType: {
    fontSize: '12px',
    color: '#8b5cf6',
    fontStyle: 'italic'
  },
  
  generateButton: { 
    width: '100%', 
    padding: '16px 24px', 
    backgroundColor: '#059669', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '16px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s'
  },
  
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }
};
