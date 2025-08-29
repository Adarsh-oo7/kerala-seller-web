'use client';

export default function StoreContact({ store }) {
  return (
    <div style={styles.contactSection}>
      <div style={styles.contactContainer}>
        <h3>Contact {store.name}</h3>
        <div style={styles.contactInfo}>
          <div style={styles.contactItem}>
            <strong>Phone:</strong> 
            <a href={`tel:${store.seller_phone}`} style={styles.contactLink}>
              {store.seller_phone}
            </a>
          </div>
          
          {store.whatsapp_number && (
            <div style={styles.contactItem}>
              <strong>WhatsApp:</strong> 
              <a href={`https://wa.me/${store.whatsapp_number}`} style={styles.contactLink}>
                {store.whatsapp_number}
              </a>
            </div>
          )}
          
          {store.instagram_link && (
            <div style={styles.contactItem}>
              <strong>Instagram:</strong> 
              <a href={store.instagram_link} target="_blank" rel="noopener noreferrer" style={styles.contactLink}>
                Follow us
              </a>
            </div>
          )}
          
          {store.facebook_link && (
            <div style={styles.contactItem}>
              <strong>Facebook:</strong> 
              <a href={store.facebook_link} target="_blank" rel="noopener noreferrer" style={styles.contactLink}>
                Like our page
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  contactSection: {
    backgroundColor: '#f8f9fa',
    borderTop: '1px solid #e9ecef',
    padding: '40px 0',
    marginTop: '60px'
  },
  contactContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    textAlign: 'center'
  },
  contactInfo: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    flexWrap: 'wrap',
    marginTop: '20px'
  },
  contactItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  contactLink: {
    color: '#0d6efd',
    textDecoration: 'none',
    fontWeight: '500'
  }
};
