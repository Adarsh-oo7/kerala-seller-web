"use client";

import React from "react";
import "../../styles/ShippingDeliveryPolicy.css";
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

export default function ShippingDeliveryPolicy() {
    return (
        <div>
            <Header />
            <div className="policy-container">
                <div className="policy-content">
                    <h1 className="policy-title">Shipping & Delivery Policy</h1>

                    <p>
                        Kerala Sellers is a technology platform that enables independent
                        sellers and businesses to create and manage their own online stores.
                        Kerala Sellers does not directly handle shipping, delivery, or
                        logistics of products listed on the platform.
                    </p>

                    <p>
                        All orders placed through Kerala Sellers are fulfilled and shipped by
                        individual sellers. Therefore, shipping methods, charges, and delivery
                        timelines may vary from seller to seller.
                    </p>

                    <h2>Seller Responsibility</h2>
                    <p>
                        Each seller is responsible for processing, packaging, and shipping
                        their products. Customers are advised to review the shipping details
                        provided on the seller’s store page before placing an order.
                    </p>

                    <h2>Domestic Shipping</h2>
                    <ul>
                        <li>Shipping charges (if applicable) are defined by the seller.</li>
                        <li>Dispatch timelines vary depending on the seller.</li>
                        <li>
                            Estimated delivery time typically ranges between 3–10 business days,
                            but may vary.
                        </li>
                        <li>
                            Some locations may not support door delivery; customers may need to
                            collect parcels from local courier/post offices.
                        </li>
                    </ul>

                    <h2>International Shipping</h2>
                    <ul>
                        <li>Availability depends on the individual seller.</li>
                        <li>
                            Shipping charges are calculated based on destination and parcel
                            weight.
                        </li>
                        <li>
                            Delivery timelines may range between 7–20 business days depending on
                            location.
                        </li>
                        <li>No Cash on Delivery (COD) for international orders.</li>
                    </ul>

                    <h2>Duties & Taxes</h2>
                    <p>
                        For international orders, customs duties, import taxes, and local
                        charges (if applicable) must be borne by the customer. These charges
                        vary by country and are not controlled by Kerala Sellers or the seller.
                    </p>

                    <h2>Order Tracking</h2>
                    <p>
                        Once an order is shipped, the seller may provide tracking details via
                        email or through their store. Tracking availability depends on the
                        shipping service used by the seller.
                    </p>

                    <h2>Delivery Delays</h2>
                    <p>
                        Delivery timelines are estimates and may be affected by factors such as
                        courier delays, weather conditions, customs clearance, or regional
                        restrictions. Kerala Sellers is not responsible for delays caused by
                        logistics providers or sellers.
                    </p>

                    <h2>Platform Limitations</h2>
                    <ul>
                        <li>Kerala Sellers does not guarantee delivery timelines</li>
                        <li>We are not responsible for lost, damaged, or delayed shipments</li>
                        <li>Shipping disputes must be resolved directly with the seller</li>
                    </ul>

                    <h2>Support</h2>
                    <p>
                        For shipping-related queries, customers should contact the respective
                        seller directly. For platform-related assistance, you may reach us at:
                        <br />
                        <strong>support@keralasellers.com</strong>
                    </p>

                    <p className="note">
                        By using Kerala Sellers, you acknowledge that the platform acts solely
                        as an intermediary between buyers and independent sellers.
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
}