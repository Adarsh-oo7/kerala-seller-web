'use client';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import '../../../../styles/DashboardBilling.css'
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
  CheckCircle,
  Clock,
  Settings,
  RefreshCw,
  Banknote,
  Wallet,
  Coin,
  CoinsIcon
} from 'lucide-react';

// ✅ Using environment variables for API URLs
// const API_BASE_URL = 'https://api.keralasellers.in' || process.env.NEXT_PUBLIC_API_URL || 'https://api.keralasellers.in';
// const PRODUCTS_API_URL = `${API_BASE_URL}/api/products/`;
// const CREATE_BILL_URL = `${API_BASE_URL}/user/orders/create-local-bill/`; // ✅ CHANGED
// const GENERATE_BILL_URL = `${API_BASE_URL}/user/orders/generate-local-bill/`; // ✅ NEW

// ✅ Works in local + production
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (typeof window !== 'undefined'
    ? 'https://api.keralasellers.in'
    : 'http://localhost:8000/api');

const PRODUCTS_API_URL = `${API_BASE_URL}/api/products/`;
const CREATE_BILL_URL = `${API_BASE_URL}/user/orders/create-local-bill/`;      // ✅ CHANGED
const GENERATE_BILL_URL = `${API_BASE_URL}/user/orders/generate-local-bill/`;  // ✅ NEW

console.log('🧾 Local bill APIs:', {
  API_BASE_URL,
  PRODUCTS_API_URL,
  CREATE_BILL_URL,
  GENERATE_BILL_URL,
});


export default function LocalBillingPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [billItems, setBillItems] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [sellerPhone, setSellerPhone] = useState('');
  const [isAutoDetecting, setIsAutoDetecting] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ✅ Better token handling
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('sellerAccessToken') ||
      localStorage.getItem('authToken');

    if (!token) {
      console.error("Seller is not authenticated.");
      setError("Please log in to access billing features.");
      return null;
    }

    return { 'Authorization': `Bearer ${token}` };
  }, []);

  // ✅ AUTO-DETECT SELLER PHONE from /api/store/profile/
  const autoDetectSellerPhone = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    setIsAutoDetecting(true);

    try {
      console.log('🔍 Auto-detecting seller phone...');

      // Try store profile API (this worked in your logs)
      try {
        const response = await axios.get(`${API_BASE_URL}/api/store/profile/`, { headers });
        console.log('Store profile response:', response.data);

        const phone = response.data.seller_phone ||
          response.data.phone ||
          response.data.seller?.phone;

        if (phone) {
          setSellerPhone(phone);
          localStorage.setItem('sellerPhone', phone);
          console.log('✅ Phone detected from store profile:', phone);
          setIsAutoDetecting(false);
          return;
        }
      } catch (error) {
        console.log('Store profile API failed');
      }

      // Fallback to localStorage
      const storedPhone = localStorage.getItem('sellerPhone') ||
        localStorage.getItem('seller_phone') ||
        localStorage.getItem('userPhone');

      if (storedPhone) {
        setSellerPhone(storedPhone);
        console.log('✅ Phone found in localStorage:', storedPhone);
        setIsAutoDetecting(false);
        return;
      }

      console.log('⚠️ Could not auto-detect seller phone. Manual input required.');

    } catch (error) {
      console.error('Auto-detection failed:', error);
    } finally {
      setIsAutoDetecting(false);
    }
  }, [getAuthHeaders]);

  // ✅ Fetch products with local stock only
  const fetchProducts = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    setIsLoading(true);
    setError('');

    try {
      console.log('Fetching products from:', PRODUCTS_API_URL);
      const response = await axios.get(PRODUCTS_API_URL, { headers });
      const productData = response.data.results || response.data || [];

      // Filter to show only products with local stock
      const locallyAvailableProducts = productData.filter(product => {
        const localStock = product.total_stock || 0;
        return localStock > 0;
      });

      console.log(`Fetched ${productData.length} products, ${locallyAvailableProducts.length} locally available`);
      setProducts(locallyAvailableProducts);
      setFilteredProducts(locallyAvailableProducts);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
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

  // ✅ Auto-detect seller phone and fetch products on mount
  useEffect(() => {
    autoDetectSellerPhone();
    fetchProducts();
  }, [autoDetectSellerPhone, fetchProducts]);

  const addToBill = (product) => {
    if (product.total_stock <= 0) {
      setError(`${product.name} is out of stock`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    setBillItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        const newQuantity = existingItem.quantity + 1;
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

    setSuccess(`Added ${product.name} to bill`);
    setTimeout(() => setSuccess(''), 2000);
  };

  const updateQuantity = (productId, quantity) => {
    const newQty = Math.max(1, parseInt(quantity, 10) || 1);
    const product = products.find(p => p.id === productId);

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

  const validateForm = () => {
    if (!sellerPhone) {
      setError('Please enter your phone number to generate bills');
      return false;
    }

    if (sellerPhone.length !== 10 || !/^\d+$/.test(sellerPhone)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }

    if (customer.phone && (customer.phone.length !== 10 || !/^\d+$/.test(customer.phone))) {
      setError('Please enter a valid 10-digit customer phone number');
      return false;
    }

    return true;
  };

  // ✅ NEW: Direct local billing (no order creation)
  const handleGenerateBill = async () => {
    if (billItems.length === 0) {
      setError("Please add items to the bill.");
      return;
    }

    if (!validateForm()) {
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
      // ✅ Step 1: Create local bill and reduce stock
      const billData = {
        customer_name: customer.name || 'Walk-in Customer',
        customer_phone: customer.phone || '',
        seller_phone: sellerPhone,
        items: billItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: parseFloat(item.price)
        }))
      };

      console.log('🔍 Creating local bill:', billData);

      const requestConfig = {
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      };

      const billResponse = await axios.post(CREATE_BILL_URL, billData, requestConfig);
      console.log('✅ Local bill created:', billResponse.data);

      // ✅ Step 2: Generate and display bill HTML
      const billId = billResponse.data.bill_id;
      const billHtmlData = {
        bill_id: billId,
        store_phone: sellerPhone,
        customer_name: customer.name || 'Walk-in Customer',
        customer_phone: customer.phone || '',
        total_amount: calculateTotal(),
        items: billItems.map(item => ({
          name: item.name,
          model_name: item.model_name || '',
          quantity: item.quantity,
          price: parseFloat(item.price),
          total: parseFloat(item.price) * item.quantity
        }))
      };

      console.log('🔍 Generating bill HTML...');
      const htmlResponse = await axios.post(GENERATE_BILL_URL, billHtmlData, {
        headers: requestConfig.headers,
        responseType: 'blob'
      });

      // Create and open bill in new tab
      const file = new Blob([htmlResponse.data], { type: 'text/html' });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, '_blank');
      // Save seller phone for future use
      localStorage.setItem('sellerPhone', sellerPhone);
      // Reset form
      setBillItems([]);
      setCustomer({ name: '', phone: '' });
      setSuccess(`✅ Bill ${billId} generated! Stock updated automatically.`);
      setTimeout(() => setSuccess(''), 5000);
      // Refresh products to show updated stock
      fetchProducts();
    } catch (error) {
      console.error('❌ Billing error:', error);
      console.error('❌ Error response:', error.response?.data);

      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else if (error.response?.status === 400) {
        const errorData = error.response.data;
        let errorMessage = 'Invalid request. Please check your input.';

        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (errorData?.detail) {
          errorMessage = errorData.detail;
        }

        setError(errorMessage);
      } else {
        const errorMessage = error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
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
    <div className='dashboardbillingpagecontainer' style={styles.pageContainer}>
      <div className='dashboardbillingheader' style={styles.header}>
        <h1 className='dashboardbillingtitle' style={styles.pageTitle}>
          <Wallet className='dashboardbillingpackageicon' size={28} />
          Direct Local Billing
        </h1>
        <p className='dashboardbillingsubtitle' style={styles.pageSubtitle}>
          Instant cash billing for walk-in customers • No order tracking
        </p>
      </div>

      {/* ✅ SELLER PHONE INPUT SECTION */}
      <div style={styles.sellerSection}>
        <div style={styles.sellerInputGroup}>
          <Settings size={16} style={styles.inputIcon} />
          <input
            type="tel"
            placeholder={isAutoDetecting ? "Auto-detecting phone..." : "Your Phone Number (Required for billing)"}
            value={sellerPhone}
            onChange={e => setSellerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            disabled={isAutoDetecting}
            style={{
              ...styles.sellerInput,
              ...(sellerPhone && sellerPhone.length === 10 ? styles.sellerInputValid : styles.sellerInputInvalid),
              ...(isAutoDetecting ? styles.sellerInputDisabled : {})
            }}
            maxLength={10}
          />
          <button
            onClick={autoDetectSellerPhone}
            style={styles.autoDetectButton}
            title="Auto-detect phone number"
            disabled={isAutoDetecting}
          >
            <RefreshCw size={16} style={isAutoDetecting ? { animation: 'spin 1s linear infinite' } : {}} />
          </button>
          {sellerPhone && sellerPhone.length === 10 && (
            <div style={styles.validationIcon}>
              <CheckCircle size={16} color="#22c55e" /> {/* Green success icon */}
            </div>
          )}
        </div>
        {sellerPhone && sellerPhone.length !== 10 && (
          <small style={styles.validationError}>Please enter a valid 10-digit phone number</small>
        )}
        {isAutoDetecting && (
          <small style={styles.autoDetectStatus}>🔍 Trying to detect your phone number automatically...</small>
        )}
      </div>

      {/* LOCAL STOCK INFO BANNER */}
      <div className='dashboardbillinginfobanner' style={styles.infoBanner}>
        <div className='dashboardbillinginventoryinfo' style={styles.inventoryInfo}>
          <Package size={16} style={styles.inventoryIcon} />
          <span style={styles.inventoryText}>
            Showing only products with local inventory ({filteredProducts.length} available)
          </span>
        </div>
        <div style={styles.directBillingBadge}>
          <Receipt size={18} color="#e82a2aff" style={{ marginRight: 6 }} />
          Direct Billing – No Order Creation
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div style={styles.errorMessage}>
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={() => setError('')} style={styles.closeButton}>
            <X size={14} />
          </button>
        </div>
      )}

      {success && (
        <div style={styles.successMessage}>
          <CheckCircle size={16} />
          <span>{success}</span>
          <button onClick={() => setSuccess('')} style={styles.closeButton}>
            <X size={14} />
          </button>
        </div>
      )}

      <div className='dashboardbillinglayoutgrid' style={styles.billingLayout}>
        {/* Product Selection */}
        <div style={styles.productSelection}>
          <div style={styles.sectionHeader}>
            <h3 className='dashboardbillingsectiontitle' style={styles.sectionTitle}>
              <Package className='dashboardbillingsectionicon' size={20} />
              Local Products
            </h3>
            <div className='dashboardbillingstockcounter' style={styles.stockCounter}>
              {filteredProducts.length} items in stock
            </div>
          </div>

          <div style={styles.searchContainer}>
            <Search size={18} style={styles.searchIcon} />
            <input
              className='dashboardbillinginput'
              type="text"
              placeholder="Search local inventory..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div className='billingscroll' style={styles.productList}>
            {isLoading ? (
              <div style={styles.loadingProducts}>
                <div style={styles.spinner}></div>
                <p>Loading local inventory...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => addToBill(product)}
                  style={styles.productItem}
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
                      <span style={styles.localStockBadge}>
                        📦 {product.total_stock} in store
                      </span>
                    </div>
                  </div>
                  <div className='dashboardbillingaddbtn' style={styles.addButton}>
                    <Plus className='dashboardbillingaddbtnicon' size={16} />
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.noProducts}>
                <Package size={32} />
                <p>No local inventory found</p>
                <small style={styles.noProductsHint}>
                  Products need local stock to appear in billing
                </small>
              </div>
            )}
          </div>
        </div>

        {/* Current Bill */}
        <div style={styles.currentBill}>
          <div style={styles.sectionHeader}>
            <h3 className='dashboardbillingsectiontitle' style={styles.sectionTitle}>
              <Banknote className='dashboardbillingsectionicon' size={20} />
              Cash Bill
            </h3>
            {billItems.length > 0 && (
              <button className='dashboardbillingclearbtn' onClick={clearBill} style={styles.clearButton}>
                Clear All
              </button>
            )}
          </div>

          <div style={styles.customerDetails}>
            <div style={styles.inputGroup}>
              <User size={16} style={styles.inputIcon} />
              <input
                className='dashboardbillinginput'
                type="text"
                placeholder="Customer Name (Optional)"
                value={customer.name}
                onChange={e => setCustomer({ ...customer, name: e.target.value })}
                style={styles.customerInput}
              />
            </div>
            <div style={styles.inputGroup}>
              <Phone size={16} style={styles.inputIcon} />
              <input
                className='dashboardbillinginput'
                type="tel"
                placeholder="Customer Phone (Optional)"
                value={customer.phone}
                onChange={e => setCustomer({ ...customer, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                style={styles.customerInput}
                maxLength={10}
              />
            </div>
          </div>

          <div style={styles.billItemsContainer}>
            {billItems.length > 0 ? (
              <div className='billingscroll' style={styles.billTableWrapper}>
                {isMobile ? (
                  // ✅ Mobile Card Layout
                  <div style={styles.mobileCardList}>
                    {billItems.map(item => (
                      <div key={item.id} style={styles.mobileCard}>
                        <div style={styles.mobileCardHeader}>
                          <div style={styles.mobileCardTitle}>
                            <div style={styles.itemName}>{item.name}</div>
                            {item.model_name && <div style={styles.itemModel}>{item.model_name}</div>}
                            <div style={styles.itemStock}>✓ Stock: {item.total_stock} available</div>
                          </div>
                          <button onClick={() => removeFromBill(item.id)} style={styles.removeButton}>
                            <X size={16} />
                          </button>
                        </div>

                        <div style={styles.mobileCardBody}>
                          <div style={styles.qtySection}>
                            <span style={styles.qtyLabel}>Quantity</span>
                            <div style={styles.qtyControls}>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                style={styles.qtyButton}
                                disabled={item.quantity <= 1}
                              >
                                <Minus size={14} />
                              </button>
                              <input
                                type="number"
                                value={item.quantity}
                                readOnly
                                style={styles.qtyInput}
                              />
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                style={styles.qtyButton}
                                disabled={item.quantity >= item.total_stock}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>

                          <div style={styles.priceSection}>
                            <div style={styles.priceLine}>
                              <span>Price</span>
                              <strong>₹{parseFloat(item.price).toFixed(2)}</strong>
                            </div>
                            <div style={styles.priceLine}>
                              <span>Total</span>
                              <strong>₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
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
                            <div style={styles.stockIndicator}>
                              Stock: {item.total_stock} available
                            </div>
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
                                max={item.total_stock}
                              />
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                style={styles.quantityButton}
                                disabled={item.quantity >= item.total_stock}
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
                )}
              </div>
            ) : (
              <div style={styles.emptyBill}>
                <Banknote size={32} />
                <p>No items in bill</p>
                <p style={styles.emptyBillHint}>Click on products to add them</p>
              </div>
            )}
          </div>

          {billItems.length > 0 && (
            <>
              <div style={styles.billSummary}>
                <div className='dashboardbillingtotalcash' style={styles.billTotal}>
                  <span>Total Cash Amount: </span>
                  <strong>₹{calculateTotal().toFixed(2)}</strong>
                </div>
                <div style={styles.billItems}>
                  {billItems.length} item{billItems.length !== 1 ? 's' : ''}
                </div>
                <div style={styles.billType}>
                  <Banknote size={12} style={{ marginRight: '4px' }} />
                  <small>Direct Cash Payment • No Order Tracking</small>
                </div>
              </div>

              <button
                className='dashboardbillinggeneratebtn'
                onClick={handleGenerateBill}
                disabled={isProcessing || !sellerPhone || sellerPhone.length !== 10 || isAutoDetecting}
                style={{
                  ...styles.generateButton,
                  ...(isProcessing || !sellerPhone || sellerPhone.length !== 10 || isAutoDetecting ? styles.generateButtonDisabled : {})
                }}
              >
                {isProcessing ? (
                  <span style={styles.buttonContent}>
                    <div style={styles.spinner}></div>
                    Processing Bill...
                  </span>
                ) : isAutoDetecting ? (
                  <span style={styles.buttonContent}>
                    <RefreshCw size={18} />
                    Detecting Phone...
                  </span>
                ) : !sellerPhone || sellerPhone.length !== 10 ? (
                  <span style={styles.buttonContent}>
                    <AlertCircle size={18} />
                    Enter Valid Phone Number
                  </span>
                ) : (
                  <span style={styles.buttonContent}>
                    <Banknote size={18} />
                    Generate Cash Bill
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
            .billingscroll::-webkit-scrollbar {
              height: 2px;   /* for horizontal scrollbar */
              width: 2px;    /* for vertical scrollbar */
            }
          
            .billingscroll::-webkit-scrollbar-track {
              background: #f1f1f1;  /* track background */
              border-radius: 6px;
            }
          
            .billingscroll::-webkit-scrollbar-thumb {
              background: #f1f1f1;  /* thumb (scroll handle) color */
              border-radius: 6px;
            }
          
            .billingscroll::-webkit-scrollbar-thumb:hover {
              background: #f1f1f1;  /* darker on hover */
            }
          
            /* Firefox support */
            .billingscroll {
              scrollbar-width: thin;
              scrollbar-color: #175E54 #FDFFF0;
            }
      `}</style>
    </div>
  );
}

// ✅ Enhanced styles for direct billing
const styles = {
  pageContainer: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
    backgroundColor: '#FDFFF0'
  },

  header: {
    marginBottom: '20px'
  },

  pageTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'rgb(23, 94, 84)',
    margin: '0 0 8px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },

  pageSubtitle: {
    fontSize: '1rem',
    color: '#6b7280',
    margin: 0,
    display: 'flex',
    alignItems: 'center'
  },

  sellerSection: {
    marginBottom: '20px',
  },

  sellerInputGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    maxWidth: '350px', // prevents it from becoming too wide on desktop
    boxSizing: 'border-box',
  },

  sellerInput: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    fontWeight: '500'
  },

  sellerInputValid: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5'
  },

  sellerInputInvalid: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2'
  },

  sellerInputDisabled: {
    backgroundColor: '#f9fafb',
    color: '#6b7280',
    cursor: 'not-allowed'
  },

  autoDetectButton: {
    position: 'absolute',
    right: '40px',
    color: '#10b981',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  validationIcon: {
    position: 'absolute',
    right: '12px',
    fontSize: '16px'
  },

  validationError: {
    color: '#ef4444',
    fontSize: '12px',
    marginTop: '4px',
    marginLeft: '40px'
  },

  autoDetectStatus: {
    color: '#3b82f6',
    fontSize: '12px',
    marginTop: '4px',
    marginLeft: '40px'
  },

  infoBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#dbeafe',
    border: '1px solid #3b82f6',
    borderRadius: '8px',
    color: '#1e40af',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '500'
  },

  inventoryInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px', // space between icon and text
    color: '#374151',
    fontSize: '14px',
  },

  inventoryIcon: {
    flexShrink: 0, // prevent icon from squishing
    color: '#2563eb', // optional accent color
  },

  inventoryText: {
    lineHeight: '1.4',
  },

  directBillingBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#f4ece9ff',  // light green tint
    color: '#e82a2aff',            // deep green text
    padding: '5px 10px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 500,
    width: 'fit-content',
    border: '1px solid #f75454ff',
  },

  errorMessage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    justifyContent: 'space-between',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #10b981',
    borderRadius: '8px',
    color: '#065f46',
    marginBottom: '20px'
  },

  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'inherit',
    opacity: 0.7,
    padding: '2px'
  },

  billingLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    boxSizing: "border-box",
  },

  productSelection: {
    backgroundColor: '#FDFFF0',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #d9d9d9ff',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
  },

  currentBill: {
    backgroundColor: '#FDFFF0',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
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

  stockCounter: {
    fontSize: '12px',
    color: '#059669',
    fontWeight: '500',
    backgroundColor: '#ecfdf5',
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px solid #10b981'
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
    border: '1px solid rgba(72, 184, 169, 1)',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: 'rgba(23, 94, 85, 0.07)'
  },

  productList: {
    maxHeight: '470px',
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
    border: '1px solid rgba(72, 184, 169, 1)',
    marginBottom: '8px',
    transition: 'all 0.2s ease',
    backgroundColor: 'rgba(23, 94, 85, 0.07)'
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
    marginBottom: '4px'
  },

  productStock: {
    fontSize: '12px',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },

  localStockBadge: {
    fontSize: '11px',
    color: '#059669',
    backgroundColor: '#ecfdf5',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: '500'
  },

  addButton: {
    width: '32px',
    height: '32px',
    backgroundColor: 'rgb(23, 94, 84)',
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
    gap: '8px',
    color: '#6b7280',
    textAlign: 'center'
  },

  noProductsHint: {
    fontSize: '12px',
    color: '#9ca3af',
    fontStyle: 'italic'
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
    border: '1px solid rgba(72, 184, 169, 1)',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: 'rgba(23, 94, 85, 0.07)'

  },

  billItemsContainer: {
    marginBottom: '20px'
  },

  billTableWrapper: {
    maxHeight: '220px',           // limit table height
    overflowY: 'auto',            // enable vertical scrolling
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    marginTop: '10px',
    position: 'relative',
  },

  billTable: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '500px',
  },

  billTableHeader: {
    position: 'sticky',
    top: 0,
    backgroundColor: 'rgb(23, 94, 84)',
    zIndex: 2,
  },

  billTableHeaderCell: {
    padding: '12px 8px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: 'rgb(23, 94, 84)',
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
    color: '#6b7280',
    marginTop: '2px'
  },

  stockIndicator: {
    fontSize: '10px',
    color: '#059669',
    backgroundColor: '#ecfdf5',
    padding: '2px 4px',
    borderRadius: '2px',
    marginTop: '4px',
    display: 'inline-block'
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
    border: '1px solid rgb(23, 94, 84)',
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
    border: '1px solid rgb(23, 94, 84)',
    borderRadius: '4px',
    fontSize: '12px',
    backgroundColor: '#FDFFF0'
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
    backgroundColor: '#fef2f2',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '16px',
    border: '1px solid #fecaca'
  },

  billTotal: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#dc2626',
    marginBottom: '4px'
  },
  billItems: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '8px'
  },
  billType: {
    fontSize: '12px',
    color: '#dc2626',
    fontStyle: 'italic',
    display: 'flex',
    alignItems: 'center'
  },

  generateButton: {
    width: '100%',
    padding: '16px 24px',
    backgroundColor: '#dc2626',
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

  generateButtonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed'
  },

  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  mobileCardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  mobileCard: {
    border: '1px solid #abababff',
    borderRadius: '10px',
    padding: '16px',
    background: '#FDFFF0',
  },
  mobileCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  mobileCardTitle: { flex: 1 },
  itemName: { fontWeight: 600, fontSize: '14px', color: '#111' },
  itemModel: { fontSize: '12px', color: '#666', marginTop: '4px' },
  itemStock: { fontSize: '12px', color: '#16a34a', marginTop: '4px' },

  qtySection: { flex: 1 },
  qtyLabel: { fontSize: '12px', color: '#666' },
  qtyControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '6px',
  },
  qtyButton: {
    width: '28px',
    height: '28px',
    border: '1px solid rgb(23, 94, 84)',
    borderRadius: '6px',
    background: '#f9fafb',
    cursor: 'pointer',
  },
  qtyInput: {
    width: '40px',
    textAlign: 'center',
    border: '1px solid #ccc',
    borderRadius: '6px',
    padding: '4px',
    fontSize: '13px',
    backgroundColor: '#FDFFF0'
  },

  priceSection: {
    textAlign: 'right',
    marginTop: '10px',
    borderTop: '1px solid #eee',
    paddingTop: '8px',
  },
  priceLine: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    marginTop: '2px',
  },
};

          