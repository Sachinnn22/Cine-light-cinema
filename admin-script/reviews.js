let currentPage = 0;
const pageSize = 3;

const prevBtn = document.getElementById("pre-review");
const nextBtn = document.getElementById("next-review");
const pageDisplay = document.getElementById("currentPageDisplayReview");
const container = document.getElementById("review-card-container");

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

async function fetchReviews(page = 0) {
    container.innerHTML = "<p>Loading reviews...</p>";
    try {
        const response = await fetch(`http://localhost:8080/api/reviews/paginated?page=${page}&size=${pageSize}`);
        const data = await response.json();

        // If no data and not on first page, go back
        if (data.length === 0 && page > 0) {
            currentPage--;
            return fetchReviews(currentPage);
        }

        container.innerHTML = "";

        if (data.length === 0) {
            container.innerHTML = "<p>No reviews available.</p>";
        } else {
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
        }

        // Update page number display
        pageDisplay.innerText = `Page ${currentPage + 1}`;

        // Button state control
        prevBtn.disabled = (currentPage === 0);
        nextBtn.disabled = (data.length < pageSize); // Disable next if it's the last page

    } catch (error) {
        console.error("Failed to fetch reviews:", error);
        container.innerHTML = "<p style='color:red;'>Failed to load reviews. Please try again later.</p>";
    }
}

prevBtn.addEventListener("click", () => {
    if (currentPage > 0) {
        currentPage--;
        fetchReviews(currentPage);
    }
});

nextBtn.addEventListener("click", () => {
    currentPage++;
    fetchReviews(currentPage);
});

// Initial fetch
fetchReviews(currentPage);