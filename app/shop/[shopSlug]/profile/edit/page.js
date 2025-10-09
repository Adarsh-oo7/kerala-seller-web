'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, User, Phone, MapPin, AlertTriangle } from 'lucide-react';
import SHeader from '../../../../../components/common/SHeader';
import "../../../../../styles/ShopProfileEdit.css";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export default function ShopEditProfilePage() {
  const { shopSlug } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [profileData, setProfileData] = useState({
    full_name: '', email: '', phone_number: '',
    address_line_1: '', address_line_2: '', city: '', pincode: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storeData, setStoreData] = useState(null);
  const [urlError, setUrlError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // ✅ ADD: Login state for SHeader



  // ✅ ADD: Check login status for SHeader
  useEffect(() => {
    try {
      const token = localStorage.getItem('buyerAccessToken') ||
        localStorage.getItem('access_token') ||
        localStorage.getItem('accessToken');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.warn('localStorage access error:', error);
      setIsLoggedIn(false);
    }
  }, []);


  // Get actual store ID from URL parameters (matching profile page logic)
  const getActualStoreId = () => {
    console.log('🔍 Getting store ID for edit profile...');
    console.log('- shopSlug from params:', shopSlug);
    console.log('- id from search params:', searchParams.get('id'));

    if (shopSlug === 'undefined' || shopSlug === undefined) {
      setUrlError('Invalid shop slug in URL');
      return null;
    }

    const queryId = searchParams.get('id');
    if (queryId && queryId !== 'undefined' && queryId.trim() !== '') {
      return queryId.trim();
    }

    if (shopSlug && shopSlug !== 'new' && shopSlug !== 'undefined') {
      return shopSlug;
    }

    setUrlError('No valid store ID found');
    return null;
  };

  const actualStoreId = getActualStoreId();
  console.log('✏️ Edit profile store ID:', actualStoreId);

  // Generate shop URLs (matching profile page logic)
  const getShopUrl = (path = '') => {
    if (!actualStoreId) {
      console.error('❌ Cannot generate URL - no store ID available');
      return '/';
    }

    if (searchParams.get('id') && shopSlug === 'new') {
      const basePath = `/shop/new${path}`;
      return `${basePath}?id=${actualStoreId}`;
    } else {
      return `/shop/${actualStoreId}${path}`;
    }
  };

  // Check authentication
  const checkAuth = () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('buyerAccessToken');
    if (!token) {
      const loginUrl = getShopUrl('/login');
      const currentUrl = getShopUrl('/profile/edit');
      const redirectUrl = `${loginUrl}?redirect=${encodeURIComponent(currentUrl)}`;
      console.log('🔐 No token, redirecting to login:', redirectUrl);
      router.push(redirectUrl);
      return null;
    }
    return { 'Authorization': `Bearer ${token}` };
  };

  // Redirect if invalid URL
  useEffect(() => {
    if (urlError || !actualStoreId) {
      console.log('🔍 Invalid edit profile URL, redirecting to home...');
      router.replace('/');
      return;
    }
  }, [urlError, actualStoreId, router]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      const headers = checkAuth();
      if (!headers) return;

      if (!actualStoreId) {
        console.error('❌ No valid store ID found');
        setLoading(false);
        return;
      }

      try {
        console.log('📡 Fetching profile data for store ID:', actualStoreId);

        const [profileRes, storeRes] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/api/buyer/profile/`, { headers }),
          fetch(`${API_BASE_URL}/shop/${actualStoreId}/`)
        ]);

        if (profileRes.status === 'fulfilled' && profileRes.value.ok) {
          const data = await profileRes.value.json();
          setProfileData(data);
          console.log('✅ Profile data loaded for editing:', data);
        } else {
          console.warn('⚠️ Profile API failed');
          if (profileRes.status === 'fulfilled') {
            const errorText = await profileRes.value.text();
            console.error('Profile API error:', profileRes.value.status, errorText);
          }
        }

        if (storeRes.status === 'fulfilled' && storeRes.value.ok) {
          const storeResData = await storeRes.value.json();
          setStoreData(storeResData.store || storeResData);
          console.log('✅ Store data loaded');
        } else {
          console.warn('⚠️ Store data not found, using fallback');
          setStoreData({
            name: `Store ${actualStoreId}`,
            seller_phone: actualStoreId,
            id: actualStoreId
          });
        }
      } catch (error) {
        console.error('❌ Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (actualStoreId && !urlError) {
      fetchProfile();
    }
  }, [actualStoreId]);

  // Handle save profile - FIXED TO USE PATCH
  const handleSave = async () => {
    const headers = checkAuth();
    if (!headers) return;

    // Basic validation
    if (!profileData.full_name || !profileData.email) {
      alert('Please fill in at least your name and email');
      return;
    }

    setSaving(true);
    try {
      console.log('💾 Saving profile data...');
      console.log('📤 Profile data to save:', profileData);

      const response = await fetch(`${API_BASE_URL}/api/buyer/profile/`, {
        method: 'PATCH', // ✅ FIXED: Changed from PUT to PATCH
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      console.log('📥 Save response status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Profile updated successfully:', responseData);

        // Update local state with server response
        if (responseData.data) {
          setProfileData(responseData.data);
        }

        alert('Profile updated successfully!');
        const profileUrl = getShopUrl('/profile');
        router.push(profileUrl);
      } else {
        console.error('❌ Profile update failed:', response.status);
        const errorData = await response.text().catch(() => 'Unable to read error');
        console.error('❌ Error details:', errorData);

        if (response.status === 400) {
          alert('Please check your input data and try again');
        } else if (response.status === 401) {
          alert('Please login again');
          const loginUrl = getShopUrl('/login');
          router.push(loginUrl);
        } else {
          alert('Failed to update profile. Please try again.');
        }
      }
    } catch (error) {
      console.error('❌ Profile update error:', error);
      alert('Network error occurred. Please check your connection.');
    } finally {
      setSaving(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    const profileUrl = getShopUrl('/profile');
    console.log('🔙 Back to profile:', profileUrl);
    router.push(profileUrl);
  };

  // Handle input changes with validation
  const handleInputChange = (field, value) => {
    setProfileData({ ...profileData, [field]: value });
  };

  // Loading state
  if (loading || urlError) {
    return (
      <div style={styles.loadingContainer}>
        {urlError ? (
          <>
            <AlertTriangle size={48} color="#ef4444" />
            <h2>Invalid Edit Profile URL</h2>
            <p>{urlError}</p>
            <p>Redirecting to home...</p>
          </>
        ) : (
          <>
            <div style={styles.spinner}></div>
            <p>Loading profile...</p>
            <p style={{ fontSize: '12px', color: '#666' }}>
              Store ID: {actualStoreId || 'Not found'}
            </p>
          </>
        )}
      </div>
    );
  }

  // Error state
  if (!actualStoreId) {
    return (
      <div style={styles.loadingContainer}>
        <AlertTriangle size={48} color="#ef4444" />
        <h2>Store Not Found</h2>
        <p>Unable to identify the store. Please check the URL.</p>
        <button onClick={() => router.push('/')} style={styles.saveButton}>
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div  style={styles.pagecontainer}>
      {/* ✅ ADD: SHeader during loading */}
      <SHeader
        store={storeData}
        isLoggedIn={isLoggedIn}
      />

      <div className='shopprofileeditpagecont' style={styles.container}>




        {/* Store Context Info */}
        {/* <div style={styles.storeContext}>
        <p>Editing your profile for <strong>{storeData?.name || `Store ${actualStoreId}`}</strong></p>
        <p style={{fontSize: '12px', color: '#6b7280'}}>Store ID: {actualStoreId}</p>
      </div> */}

        <div style={styles.form}>
          <div style={styles.section}>
            <h2 className='shopprofiledittitle' style={styles.sectionTitle}>
              <User size={20} color='red' />
              Personal Information
            </h2>

            <div style={styles.inputGroup}>
              {/* <label style={styles.label}>Full Name *</label> */}
              <input
                type="text"
                className='shopprofileditinput'
                value={profileData.full_name || ''}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                style={{
                  ...styles.input,
                  borderColor: !profileData.full_name ? '#ef4444' : '#e5e7eb'
                }}
                placeholder="Enter your full name"
                required
              />
              {!profileData.full_name && (
                <p style={styles.errorText}>Full name is required</p>
              )}
            </div>

            <div style={styles.inputGroup}>
              {/* <label style={styles.label}>Email Address *</label> */}
              <input
                type="email"
                className='shopprofileditinput'
                value={profileData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                style={{
                  ...styles.input,
                  borderColor: !profileData.email ? '#ef4444' : '#e5e7eb'
                }}
                placeholder="Enter your email"
                required
              />
              {!profileData.email && (
                <p style={styles.errorText}>Email is required</p>
              )}
            </div>

            <div style={styles.inputGroup}>
              {/* <label style={styles.label}>Phone Number</label> */}
              <input
                type="tel"
                className='shopprofileditinput'
                value={profileData.phone_number || ''}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                style={styles.input}
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div style={styles.section}>
            <h2 className='shopprofiledittitle' style={styles.sectionTitle}>
              <MapPin size={20} color='red' />
              Address Information
            </h2>

            <div style={styles.inputGroup}>
              {/* <label style={styles.label}>Address Line 1</label> */}
              <input
                type="text"
                className='shopprofileditinput'
                value={profileData.address_line_1 || ''}
                onChange={(e) => handleInputChange('address_line_1', e.target.value)}
                style={styles.input}
                placeholder="Enter your address"
              />
            </div>

            <div style={styles.inputGroup}>
              {/* <label style={styles.label}>Address Line 2 (Optional)</label> */}
              <input
                type="text"
                className='shopprofileditinput'
                value={profileData.address_line_2 || ''}
                onChange={(e) => handleInputChange('address_line_2', e.target.value)}
                style={styles.input}
                placeholder="Apartment, suite, etc. (optional)"
              />
            </div>

            <div style={styles.inputRow}>
              <div style={styles.inputGroup}>
                {/* <label style={styles.label}>City</label> */}
                <input
                  type="text"
                  className='shopprofileditinput'
                  value={profileData.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  style={styles.input}
                  placeholder="City"
                />
              </div>

              <div style={styles.inputGroup}>
                {/* <label style={styles.label}>Pincode</label> */}
                <input
                  type="text"
                  className='shopprofileditinput'
                  value={profileData.pincode || ''}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  style={styles.input}
                  placeholder="Pincode"
                  maxLength="6"
                />
              </div>

            </div>

          </div>
          <div  style={styles.buttonWrapper}>
          <button
            onClick={handleSave}
            className='shopprofilesavebtn'
            disabled={saving || !profileData.full_name || !profileData.email}
            style={{
              ...styles.saveButton,
              opacity: (saving || !profileData.full_name || !profileData.email) ? 0.6 : 1,
              cursor: (saving || !profileData.full_name || !profileData.email) ? 'not-allowed' : 'pointer'
            }}
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save'}
          </button>
          </div>
        </div>

        {/* Debug Info */}
        {/* <div style={{
        backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px',
        marginTop: '20px', fontSize: '12px', color: '#666', fontFamily: 'monospace'
      }}>
        <div style={{fontWeight: 'bold', marginBottom: '8px', color: '#333'}}>🔍 Edit Profile Debug:</div>
        <div><strong>Store ID:</strong> {actualStoreId}</div>
        <div><strong>Store Name:</strong> {storeData?.name || 'Loading...'}</div>
        <div><strong>URL Pattern:</strong> {searchParams.get('id') ? 'new+id' : 'direct'}</div>
        <div><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.pathname : 'SSR'}</div>
        <div><strong>Profile Email:</strong> {profileData.email || 'Not loaded'}</div>
        <div><strong>HTTP Method:</strong> PATCH (Fixed from PUT)</div>
        <div><strong>Save Disabled:</strong> {!profileData.full_name || !profileData.email ? 'Yes (missing required fields)' : 'No'}</div>
      </div> */}
      </div>
    </div>

  );
}

const styles = {
  pagecontainer: {backgroundColor: "#FDFFF0"},
  container: { minHeight: '100vh', backgroundColor: '#FDFFF0', padding: '20px', maxWidth: '800px', margin: '0 auto', paddingTop: "150px", paddingBottom: "60px" },
  loadingContainer: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '100vh', gap: '20px', textAlign: 'center'
  },
  spinner: {
    width: '32px', height: '32px', border: '3px solid #f3f3f3',
    borderTop: '3px solid #3b82f6', borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '20px', backgroundColor: '#FDFFF0', borderRadius: '12px',
    padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  backButton: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#3b82f6', padding: '8px', borderRadius: '6px',
    transition: 'all 0.2s'
  },
  title: {
    fontSize: '20px', fontWeight: '700', color: '#1f2937',
    flex: 1, textAlign: 'center', margin: '0 16px'
  },
buttonWrapper: {
  display: 'flex',
  justifyContent: 'center',
},

saveButton: {
  backgroundColor: '#10b981',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  padding: '10px 20px',
  fontSize: '16px',
  fontWeight: '500',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  minWidth: '220px',    // ✅ ensures consistent size
  transition: 'background 0.3s ease',
},

  storeContext: {
    backgroundColor: '#ecfdf5', border: '2px solid #10b981',
    borderRadius: '12px', padding: '16px', marginBottom: '20px',
    textAlign: 'center'
  },
  form: { display: 'flex', flexDirection: 'column', gap: '24px' },
  section: {
    backgroundColor: '#FDFFF0', borderRadius: '12px', padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
  },
  sectionTitle: {
    display: 'flex', alignItems: 'center', gap: '8px',
    fontSize: '18px', fontWeight: '600', color: '#1a4845',
    marginBottom: '30px',
  },
  inputGroup: { marginBottom: '16px' },
  inputRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  label: {
    display: 'block', fontSize: '14px', fontWeight: '600',
    color: '#1a4845', marginBottom: '6px'
  },
  input: {
    width: '100%', padding: '12px 16px', backgroundColor:'#FDFFF0' ,color:'#1a4845', border: '2px solid #e5e7eb',
    borderRadius: '8px', fontSize: '16px', transition: 'all 0.2s',
    boxSizing: 'border-box'
  },
  errorText: {
    fontSize: '12px', color: '#ef4444', marginTop: '4px'
  }
};
