"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/Whatsapp.css";
import { siWhatsapp } from "simple-icons";

// -------------------------------------------------------------------
// 🔥 API BASE URL HANDLER
// -------------------------------------------------------------------

// Returns the appropriate API base URL based on environment variables or defaults
// Example environment variable settings:

// NEXT_PUBLIC_API_URL=https://another-api.example.com
// -------------------------------------------------------------------
// 🔥 API BASE URL HANDLE

// Returns the API base URL based on environment variables or defaults


// Returns the API base URL based on environment variables or defaults

const getApiBaseUrl = () => {
  const envUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== "" && envUrl !== "undefined") {
    return envUrl.trim();
  }
  return "https://api.keralasellers.in";
};

// 🔥 FUNCTION TO GET STORE NAME (same as About page)
const getStoreName = (data) => {
  if (!data) return "Store Support";

  // Try nested store object first
  if (data.store) {
    return data.store.store_name || data.store.name || "Store Support";
  }

  // Fallback to direct keys
  return data.store_name || data.business_name || data.name || data.seller_name || "Store Support";
};

function Whatsapp({ sellerPhone, shopSlug }) {
  const [isChatVisible, setChatVisible] = useState(false);
  const [storeData, setStoreData] = useState(null);
  const [showInput, setShowInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  
  useEffect(() => {
    console.log("📍 WhatsApp Component Debug:", { sellerPhone, shopSlug, storeData });
  }, [storeData]);

  // -------------------------------------------------------------------
  // 🔥 FETCH STORE DATA
  // -------------------------------------------------------------------
  const fetchStoreData = async () => {
    if (!sellerPhone) {
      setError("Invalid store URL - phone number is missing");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      let response;

      try {
        response = await axios.get(`${getApiBaseUrl()}/shop/${sellerPhone}/`, { timeout: 15000 });
        setStoreData(response.data.store || response.data);
      } catch {
        try {
          response = await axios.get(`${getApiBaseUrl()}/shop/${sellerPhone}/about/`, { timeout: 15000 });
          setStoreData(response.data);
        } catch {
          response = await axios.get(`${getApiBaseUrl()}/shop/${sellerPhone}/profile/`, { timeout: 15000 });
          setStoreData(response.data);
        }
      }
    } catch (err) {
      console.error("❌ Failed to fetch store data:", err);
      setError(err.response?.status === 404 ? "Store not found." : "Failed to load store info.");
      setStoreData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, [sellerPhone]);

  // -------------------------------------------------------------------
  // 🔥 CHAT HANDLERS
  // -------------------------------------------------------------------
  const handleChatToggle = (e) => {
    e.preventDefault();
    setChatVisible(!isChatVisible);
  };

  const handleChatSend = () => {
    let phone = storeData?.whatsapp_number || storeData?.phone || sellerPhone;
    if (!phone) return;

    // clean phone number
    phone = phone.toString().replace(/\D/g, "");
    if (!phone.startsWith("91")) phone = "91" + phone;

    const messageText = message?.trim() || `Hi ${getStoreName(storeData)}, I am interested in your products.`;
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`;

    window.open(waUrl, "_blank");
  };






  return (
    <div>
      {/* CHAT BOX */}
      <div id="whatsapp-chat" className={isChatVisible ? "show" : ""}>
        <div className="header-chat">
          <div className="head-home">
            <h3>Need Help?</h3>
            <p>Click below to contact us on WhatsApp</p>
          </div>
        </div>

        <a className="informasi" onClick={() => setShowInput(true)}>
          <div className="info-avatar">
            <img
              src="https://2.bp.blogspot.com/-y6xNA_8TpFo/XXWzkdYk0MI/AAAAAAAAA5s/RCzTBJ_FbMwVt5AEZKekwQqiDNqdNQJjgCLcBGAs/s70/supportmale.png"
              alt="Support"
            />
            <div
              className="wa-icon"
              dangerouslySetInnerHTML={{ __html: siWhatsapp.svg }}
            />

          </div>

          <div className="info-chat">
            <span className="chat-label">Enquiry</span>
            <span className="chat-nama">{getStoreName(storeData)}</span>
          </div>

          <span className="my-number">
            {storeData?.whatsapp_number || storeData?.phone || sellerPhone || ""}
          </span>
        </a>

        {/* SHOW TEXTAREA ONLY WHEN INFORMASI IS CLICKED */}
        {showInput && (
          <div className="blanter-msg" style={{ padding: "10px" }}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              id="chat-input"
              placeholder="Feel free to ask"
              maxLength="120"
              rows="2"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                resize: "none",
              }}
            ></textarea>


            <button
              id="send-it"
              onClick={handleChatSend}
              style={{
                margin: "10px 0",
                width: "100%",
                padding: "10px",
                background: "#23ab23",
                color: "white",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Send
            </button>
          </div>
        )}


        <a className="close-chat" href="#" onClick={handleChatToggle}>
          ×
        </a>
      </div>

      {/* FLOATING BUTTON */}
      <a className="blantershow-chat" href="#" onClick={handleChatToggle}>
        Need Help?
      </a>
    </div>
  );
}

export default Whatsapp;
