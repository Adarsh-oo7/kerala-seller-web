'use client';

export default function StoreBanner({ store }) {
  return (
    <div style={styles.bannerContainer}>
      <img 
        src={store.banner_image_url || 'https://placehold.co/1200x200/e9ecef/6c757d?text=Store+Banner'} 
        alt={`${store.name} banner`} 
        style={styles.banner}
        onError={(e) => {
          e.target.src = 'https://placehold.co/1200x200/e9ecef/6c757d?text=Store+Banner';
        }}
      />
      <div style={styles.storeInfo}>
        <h1 style={styles.storeName}>{store.name}</h1>
        {store.description && (
          <p style={styles.storeDescription}>{store.description}</p>
        )}
        {store.tagline && (
          <p style={styles.storeTagline}>{store.tagline}</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  bannerContainer: {
    position: 'relative',
    marginBottom: '40px'
  },
  banner: { 
    width: '100%', 
    height: '250px', 
    objectFit: 'cover', 
    backgroundColor: '#e9ecef'
  },
  storeInfo: {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    color: 'white',
    textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
    maxWidth: '600px'
  },
  storeName: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: '0 0 10px 0'
  },
  storeDescription: {
    fontSize: '1.1rem',
    margin: '0 0 5px 0',
    opacity: 0.9
  },
  storeTagline: {
    fontSize: '1rem',
    margin: 0,
    fontStyle: 'italic',
    opacity: 0.8
  }
};
