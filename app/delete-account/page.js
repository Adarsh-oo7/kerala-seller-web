import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

export const metadata = {
  title: 'Delete your Kerala Sellers account',
  description:
    'How to delete a Kerala Sellers seller account from the app or website, and what data is removed or kept.',
};

export default function DeleteAccountHelpPage() {
  return (
    <div>
      <Header />
      <main style={styles.wrap}>
        <p style={styles.kicker}>Kerala Sellers · SaaS platform</p>
        <h1 style={styles.title}>Delete your Kerala Sellers account</h1>
        <p style={styles.lead}>
          Kerala Sellers is the seller app and website for shop owners. This page explains how to close
          a seller account and what happens to your data.
        </p>

        <h2 style={styles.h2}>How to request deletion</h2>
        <ol style={styles.list}>
          <li>
            In the <strong>Kerala Sellers</strong> Android app: open <strong>More</strong>, then tap{' '}
            <strong>Delete account</strong>. Type DELETE and confirm.
          </li>
          <li>
            On the website: sign in at{' '}
            <a href="https://www.keralasellers.in/login/seller" style={styles.link}>
              keralasellers.in
            </a>
            , then open{' '}
            <a href="https://www.keralasellers.in/dashboard/seller/account/delete" style={styles.link}>
              Delete account
            </a>
            . Type DELETE and confirm.
          </li>
          <li>
            If you cannot sign in, email <strong>keralasellers.in@gmail.com</strong> from the same phone
            number used for the seller login and ask us to close the account.
          </li>
        </ol>

        <h2 style={styles.h2}>What is deleted</h2>
        <ul style={styles.list}>
          <li>Seller login is disabled. You cannot sign in again with that phone.</li>
          <li>The public shop page is hidden.</li>
          <li>App and website session tokens for that shop are removed.</li>
        </ul>

        <h2 style={styles.h2}>What may be kept</h2>
        <p style={styles.body}>
          Order, bill, and payment records needed for GST, disputes, fraud prevention, or Indian law may
          be kept. We do not sell this data. Retention is typically up to 8 years where tax records apply,
          then the records are removed or anonymised when they are no longer required.
        </p>

        <p style={styles.body}>
          This cannot be undone from the app. Read the{' '}
          <a href="https://www.keralasellers.in/privacy-policy" style={styles.link}>
            Kerala Sellers privacy policy
          </a>
          .
        </p>
      </main>
      <Footer />
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 760, margin: '0 auto', padding: '32px 16px 64px', color: '#111827' },
  kicker: { color: '#175E54', fontWeight: 700, margin: 0 },
  title: { fontSize: 28, margin: '8px 0 12px' },
  lead: { color: '#4b5563', marginBottom: 24, lineHeight: 1.65 },
  h2: { fontSize: 18, margin: '28px 0 12px', color: '#175E54' },
  body: { lineHeight: 1.65, color: '#1f2937' },
  list: { lineHeight: 1.7, color: '#1f2937', paddingLeft: 20 },
  link: { color: '#175E54', fontWeight: 700 },
};
