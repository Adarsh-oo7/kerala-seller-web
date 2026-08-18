'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, BadgeCheck, Check, MapPin, Save, Upload } from 'lucide-react';
import { defaultPolicy, POLICY_FIELDS, policiesFromStore } from '../../../lib/storePolicies';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.keralasellers.in';
const LISTING_API = `${API_BASE_URL}/user/store/homepage-listing/`;
const PROFILE_API = `${API_BASE_URL}/user/store/profile/`;
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dnmbfeckd';
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'keralasellers_preset';

async function uploadDocument(file) {
  const body = new FormData();
  body.append('file', file);
  body.append('upload_preset', UPLOAD_PRESET);
  body.append('folder', 'kerala-sellers/verification');
  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body,
  });
  const data = await response.json();
  if (!data.secure_url) throw new Error(data.error?.message || 'Upload failed');
  return { url: data.secure_url, public_id: data.public_id };
}

export default function HomepageListingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    owner_name: '',
    gst_number: '',
    business_license: '',
    business_address: '',
    city: '',
    state: 'Kerala',
    pincode: '',
    latitude: '',
    longitude: '',
  });
  const [doc, setDoc] = useState(null);
  const [docUrl, setDocUrl] = useState('');
  const [listing, setListing] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [shopName, setShopName] = useState('this shop');
  const [policies, setPolicies] = useState(policiesFromStore({ name: 'this shop' }));
  const [savingPolicies, setSavingPolicies] = useState(false);

  const headers = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login/seller');
      return null;
    }
    return { Authorization: `Bearer ${token}` };
  }, [router]);

  const applyPayload = (data) => {
    setListing(data);
    setForm((prev) => ({
      ...prev,
      owner_name: data.business?.owner_name || prev.owner_name,
      gst_number: data.business?.gst_number || prev.gst_number,
      business_license: data.business?.business_license || prev.business_license,
      business_address: data.location?.business_address || prev.business_address,
      city: data.location?.city || prev.city,
      state: data.location?.state || prev.state || 'Kerala',
      pincode: data.location?.pincode || prev.pincode,
      latitude: data.location?.latitude || prev.latitude,
      longitude: data.location?.longitude || prev.longitude,
    }));
    if (data.business?.verification_doc_url) setDocUrl(data.business.verification_doc_url);
  };

  const load = useCallback(async () => {
    const auth = headers();
    if (!auth) return;
    try {
      const [listingRes, profileRes] = await Promise.all([
        axios.get(LISTING_API, { headers: auth }),
        axios.get(PROFILE_API, { headers: auth }).catch(() => null),
      ]);
      applyPayload(listingRes.data);
      const profile = profileRes?.data?.store_profile || profileRes?.data || {};
      const name = profile.name || listingRes.data?.store_name || 'this shop';
      setShopName(name);
      setPolicies(policiesFromStore({ ...profile, name }));
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load listing status.');
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    load();
  }, [load]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const body = () => ({
    ...form,
    ...(doc ? { cloudinary_document: doc } : {}),
  });

  const save = async () => {
    const auth = headers();
    if (!auth) return;
    setSaving(true);
    setError('');
    try {
      const response = await axios.patch(LISTING_API, body(), { headers: auth });
      applyPayload(response.data);
      setMessage('Business details saved.');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save details.');
    } finally {
      setSaving(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    const auth = headers();
    if (!auth) return;
    setSaving(true);
    setError('');
    try {
      const response = await axios.post(LISTING_API, body(), { headers: auth });
      applyPayload(response.data);
      setMessage(response.data.message || 'Request submitted for superuser verification.');
    } catch (err) {
      setError(err.response?.data?.error || 'Complete the required details and try again.');
      if (err.response?.data) applyPayload(err.response.data);
    } finally {
      setSaving(false);
    }
  };

  const upload = async (file) => {
    if (!file) return;
    try {
      const uploaded = await uploadDocument(file);
      setDoc(uploaded);
      setDocUrl(uploaded.url);
      setMessage('Verification document uploaded.');
    } catch (err) {
      setError(err.message || 'Could not upload document.');
    }
  };

  const savePolicies = async () => {
    const auth = headers();
    if (!auth) return;
    setSavingPolicies(true);
    setError('');
    try {
      await axios.patch(PROFILE_API, policies, { headers: auth });
      setMessage('Shop policies saved. Buyers will see these on your shop.');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save policies. The server may still need the policy fields update.');
    } finally {
      setSavingPolicies(false);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Location is not available in this browser. Enter city and PIN manually.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude.toFixed(6);
        const longitude = position.coords.longitude.toFixed(6);
        setForm((prev) => ({ ...prev, latitude, longitude }));
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { Accept: 'application/json' } },
          );
          const geo = await response.json();
          const address = geo.address || {};
          setForm((prev) => ({
            ...prev,
            latitude,
            longitude,
            city: address.city || address.town || address.village || address.suburb || prev.city,
            state: address.state || prev.state,
            pincode: address.postcode || prev.pincode,
            business_address: prev.business_address || geo.display_name || '',
          }));
        } catch {
          setForm((prev) => ({ ...prev, latitude, longitude }));
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setError('Could not read location. Allow location access or type city and PIN.');
      },
    );
  };

  const status = listing?.status || 'not_requested';
  const locked = status === 'pending' || status === 'approved';

  if (loading) {
    return <div style={styles.wrap}><p>Loading listing request…</p></div>;
  }

  return (
    <div style={styles.wrap}>
      <h1 style={styles.title}><BadgeCheck size={22} /> Advanced settings</h1>
      <p style={styles.lead}>
        Same as the seller app. Products appear on keralasellers.in only after a superuser verifies your business details.
      </p>

      {status === 'approved' ? <p style={styles.ok}>Verified. Your products can appear on the home page.</p> : null}
      {status === 'pending' ? <p style={styles.info}>Request sent. Waiting for superuser verification.</p> : null}
      {status === 'rejected' ? <p style={styles.warn}>{listing?.note || 'Rejected. Update details and request again.'}</p> : null}
      {listing?.missing_labels?.length ? (
        <p style={styles.warn}>Still needed: {listing.missing_labels.join(', ')}</p>
      ) : null}
      {listing?.missing?.some((field) => ['name', 'description', 'whatsapp_number', 'logo'].includes(field)) ? (
        <p style={styles.lead}>
          Finish store name, WhatsApp, and logo in{' '}
          <Link href="/dashboard/seller/settings" style={styles.link}>Basic settings</Link> first.
        </p>
      ) : null}
      {message ? <p style={styles.ok}><Check size={14} /> {message}</p> : null}
      {error ? <p style={styles.warn}><AlertCircle size={14} /> {error}</p> : null}

      <form onSubmit={submit} style={styles.form}>
        <label style={styles.label}>Owner / proprietor name
          <input name="owner_name" value={form.owner_name} onChange={onChange} disabled={locked} style={styles.input} />
        </label>
        <label style={styles.label}>GST number
          <input name="gst_number" value={form.gst_number} onChange={onChange} disabled={locked} style={styles.input} />
        </label>
        <label style={styles.label}>Business license number
          <input name="business_license" value={form.business_license} onChange={onChange} disabled={locked} style={styles.input} />
        </label>
        <label style={styles.label}>Business address
          <textarea name="business_address" value={form.business_address} onChange={onChange} disabled={locked} style={styles.textarea} />
        </label>
        <div style={styles.row}>
          <label style={styles.label}>City / locality
            <input name="city" value={form.city} onChange={onChange} disabled={locked} style={styles.input} />
          </label>
          <label style={styles.label}>State
            <input name="state" value={form.state} onChange={onChange} disabled={locked} style={styles.input} />
          </label>
          <label style={styles.label}>PIN code
            <input name="pincode" value={form.pincode} onChange={onChange} disabled={locked} style={styles.input} maxLength={6} />
          </label>
        </div>
        <button type="button" onClick={detectLocation} disabled={locked || locating} style={styles.secondary}>
          <MapPin size={16} /> {locating ? 'Detecting location…' : 'Use current location'}
        </button>
        <label style={styles.label}>Verification document (GST / license)
          <div style={styles.upload}>
            {docUrl ? <img src={docUrl} alt="Verification document" style={styles.preview} /> : <Upload size={20} />}
            <input type="file" accept="image/*" disabled={locked} onChange={(event) => upload(event.target.files?.[0])} />
          </div>
        </label>
        {locked ? null : (
          <div style={styles.actions}>
            <button type="button" onClick={save} disabled={saving} style={styles.secondary}><Save size={16} /> Save details</button>
            <button type="submit" disabled={saving} style={styles.primary}>Request home page listing</button>
          </div>
        )}
      </form>

      <section style={styles.policySection}>
        <h2 style={styles.sectionTitle}>Shop policies</h2>
        <p style={styles.lead}>
          These start from Kerala Sellers defaults. You can edit them for your shop.
          Buyers complain to you if something goes wrong. Kerala Sellers provides the SaaS tool,
          may ask for clarification, or may remove the shop. Kerala Sellers is not responsible for your products or delivery.
        </p>
        {POLICY_FIELDS.map((item) => (
          <label key={item.key} style={styles.label}>
            {item.title}
            <span style={styles.policyHint}>{item.hint}</span>
            <textarea
              value={policies[item.key]}
              onChange={(event) => setPolicies((current) => ({ ...current, [item.key]: event.target.value }))}
              style={styles.policyArea}
            />
            <button
              type="button"
              onClick={() => setPolicies((current) => ({ ...current, [item.key]: defaultPolicy(item.key, shopName) }))}
              style={styles.linkButton}
            >
              Restore Kerala Sellers default
            </button>
          </label>
        ))}
        <button type="button" onClick={savePolicies} disabled={savingPolicies} style={styles.primary}>
          {savingPolicies ? 'Saving policies…' : 'Save shop policies'}
        </button>
      </section>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 760, margin: '0 auto', padding: '24px 16px 48px', color: '#111827' },
  title: { display: 'flex', gap: 8, alignItems: 'center', fontSize: 24, margin: '0 0 8px' },
  lead: { color: '#4b5563', marginBottom: 16 },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  sectionTitle: { fontSize: 20, margin: '8px 0' },
  policySection: { marginTop: 36, paddingTop: 24, borderTop: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 14 },
  policyHint: { fontWeight: 400, color: '#6b7280', fontSize: 13 },
  policyArea: { border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 12px', minHeight: 180, fontWeight: 400, lineHeight: 1.5 },
  linkButton: { alignSelf: 'flex-start', background: 'none', border: 0, color: '#175E54', fontWeight: 700, padding: 0, cursor: 'pointer' },
  label: { display: 'flex', flexDirection: 'column', gap: 6, fontWeight: 600, fontSize: 14 },
  input: { border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 12px', fontWeight: 400 },
  textarea: { border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 12px', minHeight: 80, fontWeight: 400 },
  row: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 },
  actions: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  primary: { background: '#175E54', color: 'white', border: 0, borderRadius: 8, padding: '12px 16px', fontWeight: 700, cursor: 'pointer' },
  secondary: { background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 14px', display: 'inline-flex', gap: 8, alignItems: 'center', cursor: 'pointer' },
  upload: { display: 'flex', alignItems: 'center', gap: 12 },
  preview: { width: 72, height: 72, objectFit: 'cover', borderRadius: 8 },
  ok: { color: '#047857', display: 'flex', gap: 6, alignItems: 'center' },
  info: { color: '#1d4ed8' },
  warn: { color: '#b45309', display: 'flex', gap: 6, alignItems: 'center' },
  link: { color: '#175E54', fontWeight: 700 },
};
