'use client';

/**
 * GoogleAnalytics.js
 * Injects GA4 into every page via Next.js Script (afterInteractive).
 * Exposes window.ksTrack(eventName, params) for funnel events.
 *
 * FUNNEL EVENTS:
 *   ksTrack('start_99_store_click')
 *   ksTrack('seller_registration_start')
 *   ksTrack('seller_registration_complete')
 *   ksTrack('first_product_added')
 *   ksTrack('store_link_created')
 *   ksTrack('store_activated')
 *   ksTrack('first_order_received')
 *   ksTrack('paid_plan_started')
 *   ksTrack('pricing_view')
 *   ksTrack('pos_kit_view')
 *   ksTrack('pos_prebook_start')
 *   ksTrack('whatsapp_click')
 *   ksTrack('demo_play')
 *
 * SETUP: Set NEXT_PUBLIC_GA4_ID in your environment to your real GA4 ID (G-XXXXXXXXXX).
 */

import Script from 'next/script';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || '';

export default function GoogleAnalytics() {
  const pathname = usePathname();

  // Fire page_view on every client-side route change
  useEffect(() => {
    if (typeof window.gtag === 'function' && GA4_ID) {
      window.gtag('config', GA4_ID, { page_path: pathname });
    }
  }, [pathname]);

  if (!GA4_ID || process.env.NODE_ENV !== 'production') return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
      />
      <Script
        id="ks-ga4-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA4_ID}', {
              page_path: window.location.pathname,
              anonymize_ip: true,
              cookie_flags: 'SameSite=None;Secure'
            });
            window.ksTrack = function(eventName, params) {
              try { gtag('event', eventName, Object.assign({ send_to: '${GA4_ID}' }, params || {})); } catch(e) {}
            };
          `,
        }}
      />
    </>
  );
}
