function escapeHtml(unsafe) {
    return unsafe
        ?.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function generateStars(rating) {
    const maxStars = 5;
    let stars = '';
    for (let i = 0; i < rating; i++) {
        stars += '★';
    }
    for (let i = rating; i < maxStars; i++) {
        stars += '☆';
    }
    return stars;
}

async function fetchReviews() {
    try {
        const response = await fetch("http://localhost:8080/api/reviews");
        const data = await response.json();

        const container = document.getElementById("review-card-container");
        container.innerHTML = "";

        data.forEach(q => {
            const card = document.createElement("div");
            card.className = "review-card";

            const stars = generateStars(q.rating ?? 0);

            card.innerHTML = `
                    <h2 class="review-card-username">${escapeHtml(q.username ?? "Anonymous")}</h2>
                    <p class="review-card-email">${escapeHtml(q.email ?? "N/A")}</p>
                    <p class="review-card-comment">${escapeHtml(q.comment ?? "No comment available")}</p>
                    <div class="review-card-stars">${stars}</div>
                `;

            container.appendChild(card);
        });
    } catch (error) {
        console.error("Failed to fetch reviews:", error);
    }
}

fetchReviews();