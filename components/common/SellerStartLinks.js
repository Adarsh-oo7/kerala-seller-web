'use client';

import Link from 'next/link';
import { BRAND } from '../../app/lib/brand';

export default function SellerStartLinks({ compact = false }) {
  return (
    <div className="steps-container" style={{ marginTop: compact ? 16 : 30 }}>
      <div className="step-card">
        <div>
          <h4>1. Create your seller account</h4>
          <p>Register with your mobile number. Then add shop name, logo, and products.</p>
          <Link href={BRAND.sellerStart} className="cta-primary" style={{ marginTop: 12, display: 'inline-flex' }}>
            Register as seller
          </Link>
        </div>
      </div>
      <div className="step-card">
        <div>
          <h4>2. Choose a monthly plan</h4>
          <p>After login, open Subscription and pick the plan that matches your product count. Add-ons are optional.</p>
          <Link href={BRAND.sellerLoginPlans} className="cta-primary" style={{ marginTop: 12, display: 'inline-flex' }}>
            Login and subscribe
          </Link>
        </div>
      </div>
    </div>
  );
}
