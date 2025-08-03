'use client';

import { useCart } from '../../app/context/CartContext';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity } = useCart();

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cartItems.length === 0) {
    return <div>Your cart is empty.</div>;
  }

  return (
    <div style={{padding: '20px', border: '1px solid #ccc', borderRadius: '8px'}}>
      <h2>Your Cart</h2>
      {cartItems.map(item => (
        <div key={item.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
          <span>{item.name}</span>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <input 
              type="number" 
              value={item.quantity} 
              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
              style={{width: '50px'}}
            />
            <span>x ₹{item.price}</span>
            <button onClick={() => removeFromCart(item.id)} style={{color: 'red'}}>X</button>
          </div>
        </div>
      ))}
      <hr />
      <div style={{textAlign: 'right', marginTop: '10px', fontSize: '1.2rem'}}>
        <strong>Total: ₹{total.toFixed(2)}</strong>
      </div>
      <button style={{width: '100%', marginTop: '20px', padding: '15px', backgroundColor: '#28a745', color: 'white', border: 'none'}}>
        Proceed to Checkout
      </button>
    </div>
  );
}