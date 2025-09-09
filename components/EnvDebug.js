export default function EnvDebug() {
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'black',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <div><strong>Environment Debug:</strong></div>
      <div>NODE_ENV: {process.env.NODE_ENV}</div>
      <div>API_BASE_URL: {process.env.NEXT_PUBLIC_API_BASE_URL || 'UNDEFINED'}</div>
      <div>API_URL: {process.env.NEXT_PUBLIC_API_URL || 'UNDEFINED'}</div>
      <div>Razorpay: {process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'UNDEFINED'}</div>
    </div>
  );
}
