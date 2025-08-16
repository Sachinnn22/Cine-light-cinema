function setActiveCard(index) {
    const cards = document.querySelectorAll('.pricing-card');
    cards.forEach((card, i) => {
        card.classList.remove('active-card', 'shrink-card');
        if (i === index) {
            card.classList.add('active-card');
        } else {
            card.classList.add('shrink-card');
        }
    });
}

window.onload = () => setActiveCard(1);

function openPaymentPopup(planName, amount) {
    var payment = {
        sandbox: true,
        merchant_id: "YOUR_MERCHANT_ID",
        return_url: "https://yourdomain.com/payment-success",
        cancel_url: "https://yourdomain.com/payment-cancel",
        notify_url: "https://yourdomain.com/payment-notify",
        order_id: "ORDER_" + new Date().getTime(),
        items: planName + " Plan",
        currency: "LKR",
        amount: amount,
        first_name: "CustomerFirstName",
        last_name: "CustomerLastName",
        email: "customer@example.com",
        phone: "0771234567",
        address: "No. 1, Main Street",
        city: "Colombo",
        country: "Sri Lanka"
    };

    payhere.startPayment(payment);

    payhere.onCompleted = function(orderId) {
        alert("Payment completed. OrderID: " + orderId);
    };

    payhere.onDismissed = function() {
        alert("Payment dismissed");
    };

    payhere.onError = function(error) {
        alert("Error occurred: " + error);
    };
}
