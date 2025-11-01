'use client';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Upload, Check, AlertCircle, Star, Building, CreditCard, Save, ExternalLink, Eye, EyeOff, Image as ImageIcon, Trash2, X } from 'lucide-react';

const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl !== 'undefined') return envUrl;
  return process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : 'https://keralaseller-backend.onrender.com';
};

const API_BASE_URL = getApiBaseUrl();
const API_URL = `${API_BASE_URL}/user/store/profile/`;

const CLOUDINARY_CONFIG = {
  cloudname: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dnmbfeckd',
  uploadpreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'keralasellers_preset',
  fallbackpreset: 'ml_default',
  folder: 'kerala-sellers/store-profiles',
};

const uploadToCloudinary = async (file, options = {}) => {
  const presetsToTry = [
    { preset: CLOUDINARY_CONFIG.uploadpreset, name: 'custom' },
    { preset: CLOUDINARY_CONFIG.fallbackpreset, name: 'fallback' },
  ];

  for (const { preset, name } of presetsToTry) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', preset);
      formData.append('folder', options.folder || CLOUDINARY_CONFIG.folder);
      if (options.width) formData.append('width', options.width.toString());
      if (options.height) formData.append('height', options.height.toString());
      if (options.crop) formData.append('crop', options.crop);
      formData.append('quality', 'auto:good');
      formData.append('fetch_format', 'auto');

      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudname}/image/upload`, { method: 'POST', body: formData });
      if (!response.ok) {
        if (name === 'fallback') throw new Error('Upload failed');
        continue;
      }
      const result = await response.json();
      return { success: true, url: result.secure_url, publicid: result.public_id };
    } catch (error) {
      if (name === 'fallback') return { success: false, error: error.message };
    }
  }
  return { success: false, error: 'All upload presets failed' };
};

export default function SettingsPage() {
  const [store, setStore] = useState({
    name: '', description: '', tagline: '', whatsappnumber: '', deliverytimelocal: '', deliverytimenational: '',
    paymentmethod: 'CASHFREE', acceptscod: false, cashfree_bank_account: '', cashfree_ifsc: '', cashfree_account_holder: '',
    razorpaykeyid: '', razorpaykeysecret: '', upiid: '',
  });

  const [currentLogoUrl, setCurrentLogoUrl] = useState('');
  const [currentBannerUrl, setCurrentBannerUrl] = useState('');
  const [newLogo, setNewLogo] = useState(null);
  const [newBanner, setNewBanner] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');
  const [predefinedBanners, setPredefinedBanners] = useState([]);
  const [selectedPredefinedBanners, setSelectedPredefinedBanners] = useState([]);
  const [currentBannerUrls, setCurrentBannerUrls] = useState([]);
  const [showBannerGallery, setShowBannerGallery] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isConnectingCashfree, setIsConnectingCashfree] = useState(false);
  const [cashfreeConnected, setCashfreeConnected] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSecrets, setShowSecrets] = useState({});
  const [isDeleting, setIsDeleting] = useState({ logo: false, banner: false });

  const router = useRouter();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login/seller'); return null; }
    return { Authorization: `Bearer ${token}` };
  }, [router]);

  const fetchPredefinedBanners = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/predefined-banners/`);
      setPredefinedBanners(response.data.filter(b => b.is_active));
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  }, []);

  const fetchStoreProfile = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) return;
    try {
      setIsLoading(true);
      const response = await axios.get(API_URL, { headers });
      if (response.data.store_profile) {
        setStore((prev) => ({ ...prev, ...response.data.store_profile }));
        setCurrentLogoUrl(response.data.store_profile.logo_url);
        setCurrentBannerUrl(response.data.store_profile.banner_1_url || response.data.store_profile.banner_image_url);
        const banners = [], bannerUrls = [];
        if (response.data.store_profile.predefined_banner_1) { banners.push(response.data.store_profile.predefined_banner_1); bannerUrls.push(response.data.store_profile.banner_1_url); }
        if (response.data.store_profile.predefined_banner_2) { banners.push(response.data.store_profile.predefined_banner_2); bannerUrls.push(response.data.store_profile.banner_2_url); }
        if (response.data.store_profile.predefined_banner_3) { banners.push(response.data.store_profile.predefined_banner_3); bannerUrls.push(response.data.store_profile.banner_3_url); }
        setSelectedPredefinedBanners(banners);
        setCurrentBannerUrls(bannerUrls);
      }
      await checkCashfreeStatus();
    } catch (error) {
      console.error('Error fetching store profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  const checkCashfreeStatus = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/payments/cashfree/vendor/status/`, { headers });
      if (response.data.registered) setCashfreeConnected(true);
    } catch (error) {}
  };

  useEffect(() => {
    fetchStoreProfile();
    fetchPredefinedBanners();
  }, [fetchStoreProfile, fetchPredefinedBanners]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStore((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (name === 'paymentmethod' && value !== 'CASHFREE') setCashfreeConnected(false);
  };

  const handleFileChange = async (fileType, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File too large. Max 5MB.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    setIsUploading(true);
    setErrorMessage('');
    const result = await uploadToCloudinary(file, {
      folder: `${CLOUDINARY_CONFIG.folder}/${fileType}`,
      width: fileType === 'logo' ? 400 : 1200,
      height: fileType === 'logo' ? 400 : 400,
      crop: 'fill',
    });
    if (result.success) {
      if (fileType === 'logo') {
        setNewLogo(result);
        setLogoPreview(result.url);
        setCurrentLogoUrl(result.url);
      } else {
        setNewBanner(result);
        setBannerPreview(result.url);
        setCurrentBannerUrls([result.url]);
        setSelectedPredefinedBanners([]);
      }
      setSuccessMessage(`✅ ${fileType === 'logo' ? 'Logo' : 'Banner'} uploaded! Click Save Changes.`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } else {
      setErrorMessage(`❌ Upload failed: ${result.error}`);
      setTimeout(() => setErrorMessage(''), 3000);
    }
    setIsUploading(false);
  };

  // ✅ Delete Logo Function
  const handleDeleteLogo = async () => {
    if (!currentLogoUrl && !logoPreview) return;
    
    const headers = getAuthHeaders();
    if (!headers) return;

    setIsDeleting(prev => ({ ...prev, logo: true }));
    setErrorMessage('');

    try {
      const response = await axios.patch(API_URL, {
        cloudinary_logo: null,
      }, { headers });

      if (response.data.success !== false) {
        setCurrentLogoUrl('');
        setLogoPreview('');
        setNewLogo(null);
        setSuccessMessage('✅ Logo deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting logo:', error);
      setErrorMessage('❌ Failed to delete logo');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsDeleting(prev => ({ ...prev, logo: false }));
    }
  };

  // ✅ Delete Custom Banner Function
  const handleDeleteBanner = async () => {
    if (!currentBannerUrl && !bannerPreview) return;
    
    const headers = getAuthHeaders();
    if (!headers) return;

    setIsDeleting(prev => ({ ...prev, banner: true }));
    setErrorMessage('');

    try {
      const response = await axios.patch(API_URL, {
        cloudinary_banner_1: null,
      }, { headers });

      if (response.data.success !== false) {
        setCurrentBannerUrl('');
        setBannerPreview('');
        setNewBanner(null);
        setSuccessMessage('✅ Custom banner deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      setErrorMessage('❌ Failed to delete banner');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsDeleting(prev => ({ ...prev, banner: false }));
    }
  };

  // ✅ Remove Predefined Banner
  const handleRemovePredefinedBanner = (bannerId, bannerUrl) => {
    setSelectedPredefinedBanners(prev => prev.filter(id => id !== bannerId));
    setCurrentBannerUrls(prev => prev.filter(url => url !== bannerUrl));
    setSuccessMessage('✅ Banner removed! Click Save to apply.');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCashfreeConnect = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;
    if (!store.cashfree_bank_account?.trim() || !store.cashfree_ifsc?.trim() || !store.cashfree_account_holder?.trim()) {
      setErrorMessage('All bank details required');
      return;
    }
    try {
      setIsConnectingCashfree(true);
      setErrorMessage('');
      const response = await axios.post(`${API_BASE_URL}/api/payments/cashfree/vendor/register/`, {
        bank_account: store.cashfree_bank_account,
        ifsc: store.cashfree_ifsc,
        account_holder_name: store.cashfree_account_holder,
        email: `${store.whatsappnumber}@keralasellers.com`,
      }, { headers });
      if (response.data.vendor_id) {
        setCashfreeConnected(true);
        setSuccessMessage('Bank registered! 100% sales directly to you.');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Registration failed');
    } finally {
      setIsConnectingCashfree(false);
    }
  };

  const handleBannerSelect = (bannerId, bannerUrl) => {
    if (selectedPredefinedBanners.includes(bannerId)) {
      setSelectedPredefinedBanners(prev => prev.filter(id => id !== bannerId));
      setCurrentBannerUrls(prev => prev.filter(url => url !== bannerUrl));
    } else if (selectedPredefinedBanners.length < 3) {
      setSelectedPredefinedBanners(prev => [...prev, bannerId]);
      setCurrentBannerUrls(prev => [...prev, bannerUrl]);
    } else {
      setErrorMessage('⚠️ Max 3 banners');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  // ✅ FIXED: handleSubmit - ONLY send images if NEW
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    
    if (!store.name?.trim() || !store.description?.trim() || !store.whatsappnumber?.trim()) {
      setErrorMessage('Fill all required fields');
      return;
    }
    if (store.paymentmethod === 'CASHFREE' && !cashfreeConnected) {
      setErrorMessage('Register bank account first');
      return;
    }
    if (store.paymentmethod === 'RAZORPAY' && (!store.razorpaykeyid?.trim() || !store.razorpaykeysecret?.trim())) {
      setErrorMessage('Fill Razorpay credentials');
      return;
    }
    if (store.paymentmethod === 'UPI' && !store.upiid?.trim()) {
      setErrorMessage('Fill UPI ID');
      return;
    }
    
    setIsSaving(true);
    const headers = getAuthHeaders();
    if (!headers) {
      setIsSaving(false);
      return;
    }
    
    try {
      // ✅ FIXED: Build request data - NEVER send null for images
      const requestData = {
        ...store,
        predefined_banner_1: selectedPredefinedBanners[0] || null,
        predefined_banner_2: selectedPredefinedBanners[1] || null,
        predefined_banner_3: selectedPredefinedBanners[2] || null,
      };
      
      // ✅ ONLY include cloudinary_logo if there's a NEW upload
      if (newLogo) {
        requestData.cloudinary_logo = { 
          public_id: newLogo.publicid, 
          url: newLogo.url 
        };
      }
      
      // ✅ ONLY include cloudinary_banner_1 if there's a NEW upload
      if (newBanner) {
        requestData.cloudinary_banner_1 = { 
          public_id: newBanner.publicid, 
          url: newBanner.url 
        };
      }
      
      console.log('📤 Sending request data:', requestData);
      
      const response = await axios.patch(API_URL, requestData, { headers });
      
      if (response.data.store_profile) {
        setStore((prev) => ({ ...prev, ...response.data.store_profile }));
        
        // ✅ Clear NEW upload states (but keep current URLs!)
        setNewLogo(null);
        setNewBanner(null);
        setLogoPreview('');
        setBannerPreview('');
        
        // ✅ Update current URLs from response
        if (response.data.store_profile.logo_url) {
          setCurrentLogoUrl(response.data.store_profile.logo_url);
        }
        if (response.data.store_profile.banner_1_url) {
          setCurrentBannerUrl(response.data.store_profile.banner_1_url);
        }
      }
      
      setSuccessMessage('✅ Settings updated!');
      setTimeout(() => setSuccessMessage(''), 5000);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (error) {
      console.error('❌ Update error:', error);
      setErrorMessage(error.response?.data?.error || error.response?.data?.detail || 'Update failed');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (<div style={s.load}><div style={s.spin}></div><p>Loading...</p></div>);

  return (
    <div style={s.c}>
      <div style={s.h}>
        <div><h1 style={s.t}>Store Settings</h1><p style={s.st}>Manage your store</p></div>
        <Link href="/seller/settings/advanced" style={s.al}><Shield size={16}/>Advanced<ExternalLink size={14}/></Link>
      </div>
      {successMessage && <div style={s.sa}><Check size={18}/><span>{successMessage}</span></div>}
      {errorMessage && <div style={s.ea}><AlertCircle size={18}/><span>{errorMessage}</span></div>}
      <form onSubmit={handleSubmit} style={s.f}>
        <div style={s.sec}>
          <h3 style={s.sh}><Star size={18}/>Store Images</h3>
          <div style={s.ig}>
            <div>
              <label style={s.l}>Logo{(logoPreview || currentLogoUrl) && <span style={{color:'#10b981',fontSize:'11px',marginLeft:'6px'}}>✓ {logoPreview ? 'New' : 'Set'}</span>}</label>
              <div style={s.iu}>
                {logoPreview || currentLogoUrl ? (
                  <>
                    <img src={logoPreview || currentLogoUrl} alt="Logo" style={s.lp}/>
                    <button type="button" onClick={handleDeleteLogo} disabled={isDeleting.logo} style={s.db} title="Delete logo">
                      {isDeleting.logo ? <div style={{width:'12px',height:'12px',border:'2px solid white',borderTop:'2px solid transparent',borderRadius:'50%',animation:'spin 0.6s linear infinite'}}></div> : <Trash2 size={14}/>}
                    </button>
                  </>
                ) : (
                  <div style={s.ph}><Upload size={20}/><span>No Logo</span></div>
                )}
                <div style={s.io}><input type="file" accept="image/*" onChange={(e)=>handleFileChange('logo',e.target.files[0])} style={s.hi} id="logo-up" disabled={isUploading}/><label htmlFor="logo-up" style={s.ub}>{isUploading?'Uploading...':(currentLogoUrl||logoPreview)?'📷 Change':'📤 Upload'}</label></div>
              </div>
              {logoPreview && <p style={{fontSize:'11px',color:'#f59e0b',marginTop:'6px',fontWeight:600}}>⚠️ Click Save to apply</p>}
            </div>

            <div>
              <label style={s.l}>Banner</label>
              <button type="button" onClick={()=>setShowBannerGallery(!showBannerGallery)} style={{...s.gb,backgroundColor:selectedPredefinedBanners.length>0?'#10b981':'#8b5cf6'}}><ImageIcon size={14}/>{selectedPredefinedBanners.length>0?`✅ ${selectedPredefinedBanners.length} Selected`:'🎨 Choose (Max 3)'}</button>
              {showBannerGallery && <div style={s.bg}><h4 style={{fontSize:'13px',fontWeight:600,marginBottom:'10px',color:'#374151'}}>{predefinedBanners.length>0?`Select Banners (${selectedPredefinedBanners.length}/3)`:'No banners'}</h4>{predefinedBanners.length>0?<div style={s.gg}>{predefinedBanners.map((b)=><div key={b.id} onClick={()=>handleBannerSelect(b.id,b.image_url)} style={{...s.gi,...(selectedPredefinedBanners.includes(b.id)?s.gis:{})}}><img src={b.image_url} alt={b.name} style={s.gim}/>{selectedPredefinedBanners.includes(b.id)&&<div style={s.sb}><Check size={12}/>#{selectedPredefinedBanners.indexOf(b.id)+1}</div>}<div style={s.bn}>{b.name}</div></div>)}</div>:<p style={{color:'#6b7280',fontSize:'13px',textAlign:'center',padding:'15px'}}>No banners. Contact admin.</p>}</div>}
              
              {currentBannerUrls.length>0 && <div style={{marginTop:'10px',marginBottom:'10px'}}><label style={s.l}>Selected ({currentBannerUrls.length})</label><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:'6px',marginTop:'6px'}}>{currentBannerUrls.map((url,i)=>{
                const bannerId = selectedPredefinedBanners[i];
                return (
                  <div key={i} style={{position:'relative',borderRadius:'6px',overflow:'hidden',border:'2px solid #10b981'}}>
                    <img src={url} alt={`Banner ${i+1}`} style={{width:'100%',height:'70px',objectFit:'cover'}}/>
                    <div style={{position:'absolute',top:'3px',left:'3px',backgroundColor:'#10b981',color:'white',borderRadius:'3px',padding:'2px 5px',fontSize:'10px',fontWeight:600}}>#{i+1}</div>
                    <button type="button" onClick={() => handleRemovePredefinedBanner(bannerId, url)} style={{position:'absolute',top:'3px',right:'3px',backgroundColor:'#ef4444',color:'white',border:'none',borderRadius:'3px',padding:'3px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}} title="Remove banner">
                      <X size={12}/>
                    </button>
                  </div>
                );
              })}</div></div>}
              
              <div style={{marginTop:'10px'}}><label style={s.l}>Custom Banner{(bannerPreview || currentBannerUrl) && <span style={{color:'#10b981',fontSize:'11px',marginLeft:'6px'}}>✓ {bannerPreview ? 'New' : 'Set'}</span>}</label><div style={s.iu}>{bannerPreview || currentBannerUrl ? (
                <>
                  <img src={bannerPreview || currentBannerUrl} alt="Banner" style={s.bp}/>
                  <button type="button" onClick={handleDeleteBanner} disabled={isDeleting.banner} style={s.db} title="Delete custom banner">
                    {isDeleting.banner ? <div style={{width:'12px',height:'12px',border:'2px solid white',borderTop:'2px solid transparent',borderRadius:'50%',animation:'spin 0.6s linear infinite'}}></div> : <Trash2 size={14}/>}
                  </button>
                </>
              ) : <div style={s.ph}><Upload size={20}/><span>No Banner</span></div>}<div style={s.io}><input type="file" accept="image/*" onChange={(e)=>handleFileChange('banner',e.target.files[0])} style={s.hi} id="ban-up" disabled={isUploading}/><label htmlFor="ban-up" style={s.ub}>{isUploading?'Uploading...':(currentBannerUrl||bannerPreview)?'📷 Change':'📤 Upload'}</label></div></div>{bannerPreview && <p style={{fontSize:'11px',color:'#f59e0b',marginTop:'6px',fontWeight:600}}>⚠️ Click Save to apply</p>}</div>
            </div>
          </div>
        </div>
        
        <div style={s.sec}>
          <h3 style={s.sh}><Building size={18}/>Basic Info</h3>
          <div style={s.fg}><label style={s.l}>Store Name *</label><input type="text" name="name" value={store.name} onChange={handleInputChange} required style={s.in} placeholder="My Store"/></div>
          <div style={s.fg}><label style={s.l}>Tagline</label><input type="text" name="tagline" value={store.tagline} onChange={handleInputChange} style={s.in} placeholder="Quality Products" maxLength={150}/></div>
          <div style={s.fg}><label style={s.l}>Description *</label><textarea name="description" value={store.description} onChange={handleInputChange} required rows={3} style={s.ta} placeholder="About your store..." maxLength={500}/></div>
          <div style={s.gr}>
            <div style={s.fg}><label style={s.l}>WhatsApp *</label><input type="text" name="whatsappnumber" value={store.whatsappnumber} onChange={handleInputChange} required style={s.in} placeholder="+91 9876543210"/></div>
            <div style={s.fg}><label style={s.l}>Local Delivery</label><input type="text" name="deliverytimelocal" value={store.deliverytimelocal} onChange={handleInputChange} style={s.in} placeholder="1-2 days"/></div>
          </div>
          <div style={s.fg}><label style={s.l}>National Delivery</label><input type="text" name="deliverytimenational" value={store.deliverytimenational} onChange={handleInputChange} style={s.in} placeholder="3-7 days"/></div>
        </div>
        <div style={s.sec}>
          <h3 style={s.sh}><CreditCard size={18}/>Payment</h3>
          <div style={s.fg}><label style={s.l}>Method *</label><select name="paymentmethod" value={store.paymentmethod} onChange={handleInputChange} required style={s.se}><option value="CASHFREE">Cashfree (0% Fee)</option><option value="UPI">UPI</option><option value="RAZORPAY">Razorpay</option></select></div>
          {store.paymentmethod==='CASHFREE' && <div style={s.cs}>{!cashfreeConnected?<><div style={s.ci}><AlertCircle size={14}/><span><strong>0% Fee!</strong> Enter bank details for 100% sales.</span></div><div style={s.gr}><div style={s.fg}><label style={s.l}>Account *</label><input type="text" name="cashfree_bank_account" value={store.cashfree_bank_account} onChange={handleInputChange} required style={s.in} placeholder="Account number"/></div><div style={s.fg}><label style={s.l}>IFSC *</label><input type="text" name="cashfree_ifsc" value={store.cashfree_ifsc} onChange={handleInputChange} required style={s.in} placeholder="SBIN0001234"/></div></div><div style={s.fg}><label style={s.l}>Holder Name *</label><input type="text" name="cashfree_account_holder" value={store.cashfree_account_holder} onChange={handleInputChange} required style={s.in} placeholder="Name as per bank"/></div><div style={s.bb}><Check size={16} color="#10b981"/><div><strong>Benefits:</strong><ul style={{margin:'6px 0 0 0',paddingLeft:'16px',fontSize:'13px'}}><li>0% Commission</li><li>100% sales to you</li><li>Direct transfers</li></ul></div></div><button type="button" onClick={handleCashfreeConnect} disabled={isConnectingCashfree} style={s.cb}>{isConnectingCashfree?'Registering...':'Register Bank (0% Fee)'}</button></>:<div style={s.cc}><Check size={18} color="#10b981"/><span>Bank registered! <strong>100% sales</strong> to you.</span></div>}</div>}
          {store.paymentmethod==='UPI' && <div style={s.fg}><label style={s.l}>UPI ID *</label><input type="text" name="upiid" value={store.upiid} onChange={handleInputChange} required style={s.in} placeholder="yourname@paytm"/></div>}
          {store.paymentmethod==='RAZORPAY' && <div style={s.gr}><div style={s.fg}><label style={s.l}>Key ID *</label><input type="text" name="razorpaykeyid" value={store.razorpaykeyid} onChange={handleInputChange} required style={s.in} placeholder="rzp_test_..."/></div><div style={s.fg}><label style={s.l}>Secret *</label><div style={s.pc}><input type={showSecrets.razorpay?'text':'password'} name="razorpaykeysecret" value={store.razorpaykeysecret} onChange={handleInputChange} required style={s.in} placeholder="Secret"/><button type="button" onClick={()=>setShowSecrets((p)=>({...p,razorpay:!p.razorpay}))} style={s.eb}>{showSecrets.razorpay?<EyeOff size={14}/>:<Eye size={14}/>}</button></div></div></div>}
          <div style={s.fg}><label style={s.cl}><input type="checkbox" name="acceptscod" checked={store.acceptscod} onChange={handleInputChange} style={s.cb2}/>Accept COD</label></div>
        </div>
        <div style={s.ss}><button type="submit" disabled={isSaving} style={s.sb2}>{isSaving?'Saving...':<><Save size={16}/>Save Changes</>}</button></div>
      </form>
      <style jsx>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}@keyframes slideDown{from{opacity:0;transform:translateY(-15px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

const s={c:{minHeight:'100vh',backgroundColor:'#f9fafb',padding:'16px',maxWidth:'900px',margin:'0 auto'},load:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'300px',gap:'15px'},spin:{width:'28px',height:'28px',border:'3px solid #f3f3f3',borderTop:'3px solid #3b82f6',borderRadius:'50%',animation:'spin 1s linear infinite'},h:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px',flexWrap:'wrap',gap:'12px'},t:{fontSize:'24px',fontWeight:700,color:'#1f2937',margin:0},st:{color:'#6b7280',fontSize:'13px',marginTop:'3px'},al:{display:'flex',alignItems:'center',gap:'6px',padding:'10px 16px',backgroundColor:'#3b82f6',color:'white',borderRadius:'6px',textDecoration:'none',fontSize:'13px',fontWeight:500},sa:{display:'flex',alignItems:'center',gap:'10px',padding:'14px 18px',backgroundColor:'#ecfdf5',border:'2px solid #10b981',borderRadius:'10px',color:'#065f46',marginBottom:'16px',fontSize:'14px',fontWeight:600,boxShadow:'0 3px 10px rgba(16,185,129,0.2)',animation:'slideDown 0.3s'},ea:{display:'flex',alignItems:'center',gap:'10px',padding:'14px 18px',backgroundColor:'#fef2f2',border:'2px solid #ef4444',borderRadius:'10px',color:'#991b1b',marginBottom:'16px',fontSize:'14px',fontWeight:600,boxShadow:'0 3px 10px rgba(239,68,68,0.2)',animation:'slideDown 0.3s'},f:{display:'flex',flexDirection:'column',gap:'16px'},sec:{backgroundColor:'white',borderRadius:'12px',padding:'20px',boxShadow:'0 1px 2px rgba(0,0,0,0.1)'},sh:{display:'flex',alignItems:'center',gap:'10px',fontSize:'16px',fontWeight:700,color:'#1f2937',marginBottom:'16px',paddingBottom:'12px',borderBottom:'2px solid #f3f4f6'},fg:{display:'flex',flexDirection:'column',gap:'6px',marginBottom:'12px'},gr:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'12px',marginBottom:'12px'},l:{fontSize:'13px',fontWeight:600,color:'#374151'},in:{padding:'10px 14px',border:'2px solid #e5e7eb',borderRadius:'6px',fontSize:'13px',outline:'none'},se:{padding:'10px 14px',border:'2px solid #e5e7eb',borderRadius:'6px',fontSize:'13px',outline:'none',cursor:'pointer'},ta:{padding:'10px 14px',border:'2px solid #e5e7eb',borderRadius:'6px',fontSize:'13px',outline:'none',resize:'vertical',fontFamily:'inherit'},cl:{display:'flex',alignItems:'center',gap:'6px',cursor:'pointer',fontSize:'13px'},cb2:{width:'14px',height:'14px',cursor:'pointer'},ig:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'16px'},gb:{display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',width:'100%',padding:'10px',border:'none',borderRadius:'6px',color:'white',fontSize:'13px',fontWeight:600,cursor:'pointer',marginBottom:'10px',transition:'all 0.2s'},bg:{padding:'12px',backgroundColor:'#f9fafb',borderRadius:'10px',border:'2px solid #e5e7eb',marginBottom:'10px'},gg:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:'10px'},gi:{position:'relative',border:'2px solid #e5e7eb',borderRadius:'6px',overflow:'hidden',cursor:'pointer',transition:'all 0.2s'},gis:{border:'3px solid #10b981',boxShadow:'0 3px 10px rgba(16,185,129,0.3)'},gim:{width:'100%',height:'85px',objectFit:'cover'},sb:{position:'absolute',top:'4px',right:'4px',display:'flex',alignItems:'center',gap:'3px',padding:'3px 6px',backgroundColor:'#10b981',color:'white',borderRadius:'4px',fontSize:'10px',fontWeight:600},bn:{padding:'6px',backgroundColor:'white',fontSize:'11px',fontWeight:500,color:'#374151',textAlign:'center'},iu:{position:'relative',borderRadius:'10px',overflow:'hidden',border:'2px dashed #d1d5db',backgroundColor:'#f9fafb'},lp:{width:'100%',height:'160px',objectFit:'contain',backgroundColor:'white'},bp:{width:'100%',height:'160px',objectFit:'cover'},ph:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'160px',color:'#6b7280',gap:'6px',fontSize:'13px'},io:{position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',opacity:0,transition:'opacity 0.2s'},hi:{display:'none'},ub:{display:'inline-block',padding:'10px 16px',backgroundColor:'#3b82f6',color:'white',borderRadius:'6px',cursor:'pointer',fontSize:'13px',fontWeight:500},db:{position:'absolute',top:'8px',right:'8px',backgroundColor:'#ef4444',color:'white',border:'none',borderRadius:'6px',padding:'8px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 6px rgba(239,68,68,0.4)',transition:'all 0.2s',zIndex:10},cs:{marginTop:'12px',display:'flex',flexDirection:'column',gap:'12px'},ci:{display:'flex',alignItems:'center',gap:'10px',padding:'12px 16px',backgroundColor:'#eff6ff',border:'1px solid #3b82f6',borderRadius:'10px',color:'#1e40af',fontSize:'13px'},bb:{display:'flex',alignItems:'flex-start',gap:'10px',padding:'12px',backgroundColor:'#ecfdf5',border:'2px solid #10b981',borderRadius:'10px',fontSize:'13px'},cb:{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',padding:'12px 20px',backgroundColor:'#3b82f6',color:'white',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'14px',fontWeight:600,width:'100%'},cc:{display:'flex',alignItems:'center',gap:'10px',padding:'12px 16px',backgroundColor:'#ecfdf5',border:'1px solid #10b981',borderRadius:'10px',color:'#065f46',fontWeight:600,fontSize:'13px'},pc:{position:'relative'},eb:{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'#6b7280',cursor:'pointer'},ss:{display:'flex',justifyContent:'flex-end',paddingTop:'16px'},sb2:{display:'flex',alignItems:'center',gap:'10px',padding:'14px 28px',backgroundColor:'#3b82f6',color:'white',border:'none',borderRadius:'10px',cursor:'pointer',fontSize:'15px',fontWeight:600}};
