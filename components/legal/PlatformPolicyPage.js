'use client';

import Header from '../common/Header';
import Footer from '../common/Footer';
import { platformPolicy } from '../../app/lib/storePolicies';

export default function PlatformPolicyPage({ path }) {
  const doc = platformPolicy(path);
  return (
    <div>
      <Header />
      <main style={styles.wrap}>
        <p style={styles.kicker}>Kerala Sellers · SaaS platform</p>
        <h1 style={styles.title}>{doc.title}</h1>
        <p style={styles.lead}>
          Kerala Sellers provides software for independent sellers. We are not the seller of shop products.
        </p>
        <article style={styles.body}>{doc.body}</article>
      </main>
      <Footer />
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 760, margin: '0 auto', padding: '32px 16px 64px', color: '#111827' },
  kicker: { color: '#175E54', fontWeight: 700, margin: 0 },
  title: { fontSize: 28, margin: '8px 0 12px' },
  lead: { color: '#4b5563', marginBottom: 24 },
  body: { whiteSpace: 'pre-wrap', lineHeight: 1.65, color: '#1f2937' },
};
