'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton({ 
  phoneNumber, 
  storeName = "us",
  message = "",
  position = { bottom: '20px', right: '20px' },
  showTooltip = true 
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  if (!phoneNumber) return null;

  const formatPhoneNumber = (phone) => {
    const cleanNumber = phone.replace(/\D/g, '');
    if (cleanNumber.startsWith('91') && cleanNumber.length === 12) {
      return cleanNumber;
    }
    if (cleanNumber.length === 10) {
      return `91${cleanNumber}`;
    }
    return cleanNumber;
  };

  const handleWhatsAppClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);
    
    const defaultMessage = message || `Hello ${storeName}! I'm interested in your products. Can you help me?`;
    const encodedMessage = encodeURIComponent(defaultMessage);
    const formattedNumber = formatPhoneNumber(phoneNumber);
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Main Button Container */}
      <div style={{...whatsappStyles.container, ...position}}>
        {/* Notification Bubble */}
        {!isHovered && (
          <div style={whatsappStyles.notificationBubble}>
            <div style={whatsappStyles.bubbleText}>💬 Need help?</div>
            <div style={whatsappStyles.bubbleArrow}></div>
          </div>
        )}

        {/* Main WhatsApp Button */}
        <button
          onClick={handleWhatsAppClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            ...whatsappStyles.button,
            transform: isHovered ? 'scale(1.15)' : 'scale(1)',
            boxShadow: isHovered 
              ? '0 15px 35px rgba(37, 211, 102, 0.4), 0 5px 15px rgba(0, 0, 0, 0.1)' 
              : '0 8px 25px rgba(37, 211, 102, 0.3), 0 3px 10px rgba(0, 0, 0, 0.1)',
            backgroundColor: isHovered ? '#22C55E' : '#25D366',
            filter: isClicked ? 'brightness(0.9)' : 'brightness(1)'
          }}
          title={`Chat with ${storeName} on WhatsApp`}
          aria-label={`Chat with ${storeName} on WhatsApp`}
        >
          {/* WhatsApp Icon */}
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="white"
            style={{
              transform: isHovered ? 'rotate(5deg)' : 'rotate(0deg)',
              transition: 'all 0.3s ease'
            }}
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>

          {/* Pulse Rings */}
          <div style={{...whatsappStyles.pulseRing, animationDelay: '0s'}}></div>
          <div style={{...whatsappStyles.pulseRing, animationDelay: '0.5s'}}></div>
          
          {/* Online Indicator */}
          <div style={whatsappStyles.onlineIndicator}></div>
        </button>
        
        {/* Enhanced Tooltip */}
        {showTooltip && isHovered && (
          <div style={whatsappStyles.tooltip}>
            <div style={whatsappStyles.tooltipHeader}>
              <div style={whatsappStyles.tooltipAvatar}>
                {storeName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={whatsappStyles.tooltipStoreName}>{storeName}</div>
                <div style={whatsappStyles.tooltipStatus}>
                  <span style={whatsappStyles.statusDot}></span>
                  Online now
                </div>
              </div>
            </div>
            <div style={whatsappStyles.tooltipMessage}>
              Start a conversation
            </div>
            <div style={whatsappStyles.tooltipArrow}></div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes pulse {
          0% { 
            transform: translate(-50%, -50%) scale(1); 
            opacity: 1; 
          }
          100% { 
            transform: translate(-50%, -50%) scale(2); 
            opacity: 0; 
          }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { 
            transform: translateY(0); 
          }
          40% { 
            transform: translateY(-6px); 
          }
          60% { 
            transform: translateY(-3px); 
          }
        }
        
        @keyframes slideInUp {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes glow {
          0%, 100% { 
            box-shadow: 0 0 5px rgba(37, 211, 102, 0.5); 
          }
          50% { 
            box-shadow: 0 0 20px rgba(37, 211, 102, 0.8), 0 0 30px rgba(37, 211, 102, 0.4); 
          }
        }
      `}</style>
    </>
  );
}

const whatsappStyles = {
  container: {
    position: 'fixed',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '10px'
  },
  
  // Notification Bubble
  notificationBubble: {
    position: 'relative',
    backgroundColor: 'white',
    padding: '12px 16px',
    borderRadius: '20px',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
    marginBottom: '10px',
    animation: 'slideInUp 0.5s ease-out, bounce 2s ease-in-out 2s infinite',
    maxWidth: '200px'
  },
  bubbleText: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    whiteSpace: 'nowrap'
  },
  bubbleArrow: {
    position: 'absolute',
    bottom: '-6px',
    right: '20px',
    width: 0,
    height: 0,
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderTop: '6px solid white'
  },
  
  // Main Button
  button: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#25D366',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    position: 'relative',
    animation: 'glow 3s ease-in-out infinite',
    outline: 'none',
    WebkitTapHighlightColor: 'transparent'
  },
  
  // Pulse Rings
  pulseRing: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '100%',
    height: '100%',
    border: '2px solid rgba(37, 211, 102, 0.6)',
    borderRadius: '50%',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    pointerEvents: 'none'
  },
  
  // Online Indicator
  onlineIndicator: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '14px',
    height: '14px',
    backgroundColor: '#10B981',
    borderRadius: '50%',
    border: '2px solid white',
    boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.3)'
  },
  
  // Enhanced Tooltip
  tooltip: {
    position: 'absolute',
    bottom: '80px',
    right: '0',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
    padding: '16px',
    minWidth: '250px',
    zIndex: 1001,
    animation: 'slideInUp 0.3s ease-out'
  },
  tooltipHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px'
  },
  tooltipAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#25D366',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '16px'
  },
  tooltipStoreName: {
    fontWeight: '600',
    fontSize: '16px',
    color: '#111827',
    lineHeight: '1.2'
  },
  tooltipStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#10B981',
    fontWeight: '500'
  },
  statusDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#10B981',
    borderRadius: '50%'
  },
  tooltipMessage: {
    fontSize: '14px',
    color: '#6B7280',
    lineHeight: '1.4'
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: '-8px',
    right: '24px',
    width: 0,
    height: 0,
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderTop: '8px solid white'
  }
};
