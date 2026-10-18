const sendEmail = require("./sendEmail");

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
}[character]));

const formatCurrency = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

const sendOrderReceipt = async (order, customer, items) => {
    const rows = items.map(({ name, quantity, price }) => ({
        name: name || "Faral item",
        quantity,
        price,
    }));
    const textItems = rows
        .map((item) => `${item.name} x ${item.quantity} — ${formatCurrency(item.price * item.quantity)}`)
        .join("\n");
    const htmlItems = rows.map((item) => `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #eee">${escapeHtml(item.name)}</td>
          <td style="padding:10px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
          <td style="padding:10px;border-bottom:1px solid #eee;text-align:right">${formatCurrency(item.price)}</td>
          <td style="padding:10px;border-bottom:1px solid #eee;text-align:right">${formatCurrency(item.price * item.quantity)}</td>
        </tr>`).join("");
    const name = order.address?.FullName || customer.name || "Customer";
    const address = order.address?.Street || "";
    const estimatedDelivery = order.estimatedDeliveryAt
        ? new Date(order.estimatedDeliveryAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })
        : "";
    const text = [
        `Dear ${name},`,
        "",
        "Thank you for your order! Your Diwali faral order has been placed successfully.",
        "",
        `Order ID: ${order._id}`,
        `Payment status: ${order.paymentStatus || (order.paymentId ? "Paid" : "Unpaid")}`,
        "",
        "ORDER SUMMARY",
        textItems,
        "",
        `Total: ${formatCurrency(order.totalAmount)}`,
        "",
        `Delivery address: ${address}`,
        `Phone: ${order.address?.phone || ""}`,
        ...(estimatedDelivery ? [`Estimated delivery: ${estimatedDelivery}`] : []),
        "",
        "Thank you for choosing Homemade Diwali Faral. Wishing you and your family a very Happy Diwali!",
    ].join("\n");
    const html = `
      <div style="font-family:Arial,sans-serif;color:#332211;max-width:640px;margin:auto;line-height:1.5">
        <h2 style="color:#e85d20">Thank you for your order, ${escapeHtml(name)}!</h2>
        <p>Your Diwali faral order has been placed successfully.</p>
        <p><strong>Order ID:</strong> ${escapeHtml(order._id)}<br>
        <strong>Payment status:</strong> ${escapeHtml(order.paymentStatus || (order.paymentId ? "Paid" : "Unpaid"))}</p>
        <h3>Order summary</h3>
        <table style="width:100%;border-collapse:collapse">
          <thead><tr style="background:#fff3e8">
            <th style="padding:10px;text-align:left">Item</th>
            <th style="padding:10px">Qty</th>
            <th style="padding:10px;text-align:right">Price</th>
            <th style="padding:10px;text-align:right">Subtotal</th>
          </tr></thead>
          <tbody>${htmlItems}</tbody>
        </table>
        <p style="text-align:right;font-size:18px"><strong>Total: ${formatCurrency(order.totalAmount)}</strong></p>
        <h3>Delivery details</h3>
        <p>${escapeHtml(address)}<br>Phone: ${escapeHtml(order.address?.phone || "")}
        ${estimatedDelivery ? `<br>Estimated delivery: ${escapeHtml(estimatedDelivery)}` : ""}</p>
        <p style="margin-top:28px">Thank you for choosing Homemade Diwali Faral.<br>
        <strong style="color:#e85d20">Wishing you and your family a very Happy Diwali!</strong></p>
      </div>`;

    await sendEmail(customer.email, "Your Diwali Faral order receipt", text, html);
};

module.exports = sendOrderReceipt;
