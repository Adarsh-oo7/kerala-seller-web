"use client";

import React from "react";
import "../../styles/CancellationRefundPolicy.css";
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

export default function CancellationRefundPolicy() {
    return (
        <div>
            <Header />
            <div className="policy-container">
                <div className="policy-content">
                    <h1 className="policy-title">Cancellation & Refund Policy</h1>

                    <p>
                        Kerala Sellers is a technology platform that enables independent
                        sellers, businesses, and artisans to create and manage their own
                        online stores. Kerala Sellers does not directly sell, manufacture, or
                        own any of the products listed on the platform.
                    </p>

                    <p>
                        All products listed on Kerala Sellers are offered by individual
                        sellers. Therefore, cancellation, return, and refund policies may vary
                        from seller to seller.
                    </p>

                    <h2>Seller Responsibility</h2>
                    <p>
                        Each seller on Kerala Sellers is responsible for defining their own
                        policies regarding order cancellation, returns, exchanges, and
                        refunds. Customers are advised to carefully review the respective
                        seller’s policy before making a purchase.
                    </p>

                    <h2>Order Cancellation</h2>
                    <ul>
                        <li>Cancellation requests must be made directly with the seller.</li>
                        <li>Sellers may accept or reject requests based on their policy.</li>
                        <li>Orders already shipped may not be eligible for cancellation.</li>
                    </ul>

                    <h2>Returns & Refunds</h2>
                    <ul>
                        <li>Eligibility is defined by individual sellers.</li>
                        <li>Customers must contact the seller directly.</li>
                        <li>Refund timelines depend on the seller and payment provider.</li>
                    </ul>

                    <p>
                        Kerala Sellers is not responsible for processing returns or issuing
                        refunds but may assist in communication if needed.
                    </p>

                    <h2>Dispute Resolution</h2>
                    <p>
                        Kerala Sellers may act as a mediator between buyers and sellers, but
                        the final decision lies with the seller, subject to applicable laws.
                    </p>

                    <h2>Platform Limitations</h2>
                    <ul>
                        <li>Not responsible for product quality or defects</li>
                        <li>No guarantee of refunds or returns</li>
                        <li>Issues must be resolved with the seller</li>
                    </ul>

                    <h2>Payment Refunds</h2>
                    <p>
                        Approved refunds will be processed via the original payment method.
                        Timelines depend on banking and payment systems.
                    </p>

                    <h2>Contact</h2>
                    <p>
                        support@keralasellers.com
                    </p>

                    <p className="note">
                        Kerala Sellers acts only as an intermediary platform between buyers
                        and independent sellers.
                    </p>
                </div>
            </div>
            <Footer />
        </div>

    );
}