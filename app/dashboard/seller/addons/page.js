'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Puzzle } from 'lucide-react';
import { asList } from '../../../lib/storeAccess';
import {
  addonBuyLabel,
  addonCapacityLines,
  addonCatalogIsEmpty,
  addonNeedHint,
  addonPurchaseCounts,
  collectAddonCatalog,
  partitionAddons,
} from '../../../lib/addonAccess';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.keralasellers.in';
const ENTITLEMENTS_URL = `${API_BASE_URL}/api/subscriptions/entitlements/`;
const ADDONS_URL = `${API_BASE_URL}/api/subscriptions/addons/`;
const CURRENT_URL = `${API_BASE_URL}/api/subscriptions/current/`;
const CREATE_URL = `${API_BASE_URL}/api/subscriptions/addons/create-order/`;
const VERIFY_URL = `${API_BASE_URL}/api/subscriptions/addons/verify-payment/`;
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';

function isMissingCatalog(err) {
  return err?.response?.status === 404;
}

async function loadCatalog(headers) {
  const [entitlementsResult, addonsResult, subscriptionResult] = await Promise.allSettled([
    axios.get(ENTITLEMENTS_URL, { headers }),
    axios.get(ADDONS_URL),
    axios.get(CURRENT_URL, { headers }),
  ]);

  if (entitlementsResult.status === 'rejected' && !isMissingCatalog(entitlementsResult.reason)) {
    throw entitlementsResult.reason;
  }

  const entitlements = entitlementsResult.status === 'fulfilled' ? entitlementsResult.value.data : null;
  const publicAddons = addonsResult.status === 'fulfilled' ? asList(addonsResult.value.data) : [];
  const subscription = subscriptionResult.status === 'fulfilled' ? subscriptionResult.value.data : null;
  const billing = entitlements?.billing ?? subscription?.entitlements?.billing;

  return {
    commercially_active: entitlements?.commercially_active ?? Boolean(subscription?.is_active),
    plan_id: entitlements?.plan_id ?? subscription?.plan?.id ?? subscription?.entitlements?.plan_id ?? null,
    plan_name: entitlements?.plan_name || subscription?.plan_name || subscription?.plan?.name || subscription?.entitlements?.plan_name,
    features: entitlements?.features ?? subscription?.entitlements?.features ?? [],
    addons: collectAddonCatalog({
      entitlementsAddons: entitlements?.addons,
      publicAddons,
      activeAddons: billing?.active_addons,
    }),
    billing,
  };
}

function AddonCard({ addon, badge, hint, actionLabel, disabled, onPress }) {
  const extras = addonCapacityLines(addon);
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
        <strong>{addon.name}</strong>
        {badge ? <span style={badge === 'Not on this plan' ? warningBadgeStyle : badgeStyle}>{badge}</span> : null}
      </div>
      {addon.description ? <p style={metaStyle}>{addon.description}</p> : null}
      <p style={{ margin: '8px 0', color: '#175E54', fontWeight: 700 }}>
        ₹{addon.price} / {addon.billing_period === 'one_time' ? 'one time' : addon.billing_period || 'month'}
      </p>
      {extras.map((line) => <p key={line} style={metaStyle}>• {line}</p>)}
      {hint ? <p style={metaStyle}>{hint}</p> : null}
      {actionLabel ? (
        <button type="button" disabled={disabled} onClick={onPress} style={buttonStyle}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export default function AddonsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [buying, setBuying] = useState(null);

  const headers = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const load = useCallback(async () => {
    try {
      setData(await loadCatalog(headers()));
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load add-ons.');
    }
  }, [headers]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (document.getElementById('razorpay-addon-script')) return;
    const script = document.createElement('script');
    script.id = 'razorpay-addon-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);
  }, []);

  const purchase = async (addon) => {
    setBuying(addon.id);
    try {
      const order = await axios.post(CREATE_URL, { addon_id: addon.id }, { headers: headers() });
      const rzp = new window.Razorpay({
        key: order.data.key_id || RAZORPAY_KEY_ID,
        amount: order.data.amount,
        currency: order.data.currency || 'INR',
        order_id: order.data.order_id,
        name: 'Kerala Sellers',
        description: addon.name,
        handler: async (response) => {
          await axios.post(VERIFY_URL, {
            addon_id: addon.id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          }, { headers: headers() });
          await load();
        },
      });
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not start add-on purchase.');
    } finally {
      setBuying(null);
    }
  };

  const billing = data?.billing || {};
  const purchaseCounts = useMemo(
    () => addonPurchaseCounts(billing.active_addons),
    [billing],
  );
  const groups = useMemo(
    () => partitionAddons(data?.addons || [], {
      planId: data?.plan_id,
      activeIds: purchaseCounts.keys(),
      featureCodes: data?.features,
    }),
    [data, purchaseCounts],
  );
  const emptyCatalog = addonCatalogIsEmpty(groups);
  const canPurchase = Boolean(data?.commercially_active);

  return (
    <div style={{ maxWidth: 880 }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#175E54' }}>
        <Puzzle size={22} /> Add-ons
      </h1>
      <p style={{ color: '#64748b' }}>
        Buy only the extras this shop needs. Your plan stays the same. Add GST, loyalty, extra products, staff, or locations if you need them. Capacity extras can be added more than once.
      </p>
      {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
      {!canPurchase && data ? (
        <p style={{ ...cardStyle, background: '#fffbeb', color: '#92400e' }}>
          Take a plan first, then come back and buy only the extras this shop needs.{' '}
          <Link href="/dashboard/seller/subscription" style={{ color: '#175E54', fontWeight: 600 }}>View plans</Link>
        </p>
      ) : null}
      <div style={cardStyle}>
        <div style={{ color: '#64748b', fontSize: 13 }}>{data?.plan_name || 'Current plan'}</div>
        <div style={{ fontSize: 24, color: '#175E54', fontWeight: 700 }}>₹{billing.monthly_total ?? 0}</div>
        <div style={metaStyle}>Plan ₹{billing.base_plan_price ?? 0} + add-ons ₹{billing.addons_price ?? 0} this month</div>
      </div>

      {emptyCatalog ? (
        <div style={cardStyle}>
          <strong>No extras in the catalog yet</strong>
          <p style={metaStyle}>When extra products, staff logins, GST, or locations are listed for this shop, they appear here so you can buy only what you need.</p>
        </div>
      ) : (
        <>
          <h2>Add if this shop needs it</h2>
          {groups.compatible.length === 0 ? (
            <p style={metaStyle}>Nothing extra to buy on this plan right now. Other extras are listed below.</p>
          ) : null}
          {groups.compatible.map((addon) => {
            const count = purchaseCounts.get(addon.id) || 0;
            return (
              <AddonCard
                key={addon.id}
                addon={addon}
                badge={count > 0 ? `On this shop ×${count}` : null}
                hint={addonNeedHint(addon, count)}
                actionLabel={canPurchase ? (buying === addon.id ? 'Opening payment…' : addonBuyLabel(addon, count)) : null}
                disabled={buying != null}
                onPress={canPurchase ? () => purchase(addon) : undefined}
              />
            );
          })}

          {groups.onPlan.length > 0 ? (
            <>
              <h2>Already in this plan</h2>
              {groups.onPlan.map((addon) => (
                <AddonCard
                  key={addon.id}
                  addon={addon}
                  badge="Included"
                  hint="This shop already has this on the current plan, so there is nothing extra to buy."
                />
              ))}
            </>
          ) : null}

          {groups.included.length > 0 ? (
            <>
              <h2>Already bought</h2>
              {groups.included.map((addon) => (
                <AddonCard
                  key={addon.id}
                  addon={addon}
                  badge="Active"
                  hint="This extra is already on this shop. One purchase is enough."
                />
              ))}
            </>
          ) : null}

          {groups.otherPlans.length > 0 ? (
            <>
              <h2>Not on this plan</h2>
              <p style={metaStyle}>These extras stay visible, but they cannot be added on the plan this shop is on.</p>
              {groups.otherPlans.map((addon) => (
                <AddonCard key={addon.id} addon={addon} badge="Not on this plan" />
              ))}
            </>
          ) : null}
        </>
      )}
    </div>
  );
}

const cardStyle = {
  padding: 16,
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  marginBottom: 12,
  background: '#fff',
};
const metaStyle = { color: '#64748b', fontSize: 14, margin: '6px 0 0' };
const buttonStyle = {
  marginTop: 12,
  padding: '10px 14px',
  border: 0,
  borderRadius: 8,
  background: '#175E54',
  color: '#fff',
  cursor: 'pointer',
};
const badgeStyle = {
  fontSize: 12,
  background: '#ecfdf5',
  color: '#047857',
  padding: '4px 8px',
  borderRadius: 999,
};
const warningBadgeStyle = {
  ...badgeStyle,
  background: '#fffbeb',
  color: '#b45309',
};
