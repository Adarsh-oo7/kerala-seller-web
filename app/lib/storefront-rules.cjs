'use strict';

function shouldShowRazorpayBanner(status) {
  if (!status) return false;
  return status.store_mode === 'online' && !status.razorpay_is_configured;
}

function isPublishLocked(status) {
  if (!status) return true;
  return !status.can_go_live && !status.is_storefront_published;
}

function buyerStorefrontMessage(reason) {
  switch (reason) {
    case 'PAYMENT_SETUP_REQUIRED':
      return 'This shop is not taking online orders right now. Please check back soon.';
    case 'UNPUBLISHED':
      return 'This shop is not currently available.';
    case 'SUBSCRIPTION_INACTIVE':
      return 'This shop is temporarily offline.';
    case 'OFFLINE_ONLY_NO_CHECKOUT':
      return 'Visit this shop in person. This is an in-store listing — online checkout is not available.';
    default:
      return null;
  }
}

module.exports = {
  shouldShowRazorpayBanner,
  isPublishLocked,
  buyerStorefrontMessage,
};
