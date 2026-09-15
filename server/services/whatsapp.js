/**
 * WhatsApp Notification Service for Fordoportro
 * Target Business Hotline: 01327226437 (+8801327226437)
 */

const BUSINESS_WHATSAPP_RAW = process.env.WHATSAPP_BUSINESS_NUMBER || "01327226437";

// Normalize to international format (+880...)
function formatBDPhoneNumber(phone) {
  if (!phone) return "";
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    return '88' + cleaned;
  }
  if (!cleaned.startsWith('880') && cleaned.length === 10) {
    return '880' + cleaned;
  }
  return cleaned;
}

const BUSINESS_WHATSAPP_INTL = formatBDPhoneNumber(BUSINESS_WHATSAPP_RAW);

/**
 * Format a complete order receipt for WhatsApp
 */
function generateWhatsAppOrderMessage(order) {
  const dateStr = new Date(order.createdAt || Date.now()).toLocaleString('en-GB', {
    timeZone: 'Asia/Dhaka',
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  let itemList = "";
  if (order.items && order.items.length > 0) {
    itemList = order.items.map((item, index) => {
      const price = item.price || item.discountPrice || item.regularPrice || 0;
      const total = price * item.quantity;
      return `${index + 1}. *${item.name}* (${item.unit || '1 unit'}) × ${item.quantity} = ৳${total}`;
    }).join('\n');
  }

  const message = `🛍️ *নতুন অর্ডার - ফর্দপত্র (Fordoportro)* 🛍️
━━━━━━━━━━━━━━━━━━━━
📦 *অর্ডার আইডি:* #${order.orderNumber || order._id}
📅 *তারিখ:* ${dateStr}
━━━━━━━━━━━━━━━━━━━━
👤 *গ্রাহকের তথ্য:*
- *নাম:* ${order.customerName || 'N/A'}
- *ফোন:* ${order.customerPhone || 'N/A'}
- *ঠিকানা:* ${order.shippingAddress || 'N/A'}, ${order.city || 'ঢাকা'}
${order.deliveryNote ? `- *নোট:* ${order.deliveryNote}\n` : ''}
🛒 *অর্ডারের পণ্যসমূহ:*
${itemList}
━━━━━━━━━━━━━━━━━━━━
💵 *বিল বিবরণী:*
- সাবটোটাল: ৳${order.subtotal || 0}
${order.discountAmount ? `- ডিসকাউন্ট: -৳${order.discountAmount}\n` : ''}- *সর্বমোট বিল:* ৳${order.grandTotal || order.total || 0}
- *পেমেন্ট মাধ্যম:* ${order.paymentMethod || 'ক্যাশ অন ডেলিভারি (COD)'}
- *পেমেন্ট স্ট্যাটাস:* ${order.paymentStatus || 'Pending'}
━━━━━━━━━━━━━━━━━━━━
ফর্দপত্র (Fordoportro) - কম দামে সেরা বাজার!
হটলাইন ও হোয়াটসঅ্যাপ: 01327226437
Facebook Page: https://www.facebook.com/share/1DaCe5HSkF/`;

  return message;
}

/**
 * Build click-to-chat URL for WhatsApp
 */
function buildWhatsAppLink(phone, message) {
  const formattedPhone = formatBDPhoneNumber(phone || BUSINESS_WHATSAPP_RAW);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedText}`;
}

/**
 * Automated WhatsApp notification dispatcher
 * Can send to Business Account and Customer Phone
 */
async function sendAutomatedWhatsAppNotification(order) {
  const message = generateWhatsAppOrderMessage(order);
  const businessLink = buildWhatsAppLink(BUSINESS_WHATSAPP_RAW, message);
  const customerLink = order.customerPhone ? buildWhatsAppLink(order.customerPhone, message) : null;

  console.log(`\n========================================`);
  console.log(`📱 AUTOMATED WHATSAPP NOTIFICATION TRIGGERED`);
  console.log(`Target Business Phone: ${BUSINESS_WHATSAPP_RAW} (${BUSINESS_WHATSAPP_INTL})`);
  console.log(`Order ID: #${order.orderNumber || order._id}`);
  console.log(`Customer: ${order.customerName} (${order.customerPhone})`);
  console.log(`Amount: ৳${order.grandTotal || order.total}`);
  console.log(`Direct WhatsApp URL: ${businessLink}`);
  console.log(`========================================\n`);

  // Optional: If external gateway webhook/API key is present, POST to provider
  if (process.env.WHATSAPP_API_URL && process.env.WHATSAPP_API_KEY) {
    try {
      // Integration hook for WhatsApp Business Cloud API / UltraMsg / Twilio
      const response = await fetch(process.env.WHATSAPP_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`
        },
        body: JSON.stringify({
          to: BUSINESS_WHATSAPP_INTL,
          message: message
        })
      });
      console.log("Automated WhatsApp webhook dispatched, status:", response.status);
    } catch (err) {
      console.error("Automated WhatsApp webhook error:", err.message);
    }
  }

  return {
    success: true,
    messageFormatted: message,
    businessWhatsApp: BUSINESS_WHATSAPP_RAW,
    businessWhatsAppIntl: BUSINESS_WHATSAPP_INTL,
    businessWhatsAppLink: businessLink,
    customerWhatsAppLink: customerLink,
    triggeredAt: new Date().toISOString()
  };
}

module.exports = {
  BUSINESS_WHATSAPP_RAW,
  BUSINESS_WHATSAPP_INTL,
  formatBDPhoneNumber,
  generateWhatsAppOrderMessage,
  buildWhatsAppLink,
  sendAutomatedWhatsAppNotification
};
