'use client';

import { FaWhatsapp } from 'react-icons/fa'; // A popular icon library

// To use this icon, you'll need to install the library:
// npm install react-icons

export default function WhatsAppButton({ phoneNumber }) {
  if (!phoneNumber) {
    return null; // Don't show the button if no number is provided
  }

  // Format the phone number for the WhatsApp link (e.g., remove '+', spaces)
  const formattedNumber = phoneNumber.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/+91${formattedNumber}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={styles.floatingButton}
      title="Chat on WhatsApp"
    >
      <FaWhatsapp size={32} />
    </a>
  );
}

const styles = {
  floatingButton: {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    backgroundColor: '#25D366',
    color: 'white',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    zIndex: 100,
    textDecoration: 'none',
  }
};