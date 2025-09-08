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

        const reviews = data.reviews || [];
        const hasNext = data.hasNext || false;

        if (reviews.length === 0 && page > 0) {
            currentPage--;
            return fetchReviews(currentPage);
        }

        container.innerHTML = "";

        if (reviews.length === 0) {
            container.innerHTML = "<p>No reviews available.</p>";
        } else {
            reviews.forEach(q => {
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

        pageDisplay.innerText = `Page ${currentPage + 1}`;
        prevBtn.disabled = (currentPage === 0);
        nextBtn.disabled = !hasNext;

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

fetchReviews(currentPage);

let currentQuiz = 0;
let selectedQuestionId = null;

document.addEventListener('DOMContentLoaded', function () {
    loadQuestions(currentQuiz);

    document.getElementById('next').addEventListener('click', function () {
        currentQuiz++;
        loadQuestions(currentQuiz);
    });

    document.getElementById('pre').addEventListener('click', function () {
        if (currentQuiz > 0) {
            currentQuiz--;
            loadQuestions(currentQuiz);
        }
    });
});

function updatePageDisplay() {
    const pageDisplay = document.getElementById('currentPageDisplay');
    const preBtn = document.getElementById('pre');

    pageDisplay.textContent = `Page ${currentQuiz + 1}`;
    preBtn.disabled = currentQuiz === 0;
}

function loadQuestions(page) {
    const PAGE_SIZE = 3;
    const container = document.getElementById('questionsContainer');
    const nextBtn = document.getElementById('next');
    const preBtn = document.getElementById('pre');

    fetch('http://localhost:8080/api/questions/pagination/' + page)
        .then(response => {
            if (!response.ok) throw new Error('HTTP error! Status: ' + response.status);
            return response.json();
        })
        .then(questions => {
            container.innerHTML = '';
            if (questions.length === 0) {
                container.innerHTML = '<p>No questions available.</p>';
                nextBtn.disabled = true;
                preBtn.disabled = page === 0;
                updatePageDisplay();
                return;
            }

            questions.forEach(q => {
                const card = document.createElement('div');
                card.className = 'card';

                card.innerHTML = `
                    <h2 class="username_quiz">${escapeHtml(q.username ?? "Anonymous")}</h2>
                    <p class="email_quiz">${escapeHtml(q.email ?? "N/A")}</p>
                    <p class="question">${escapeHtml(q.content ?? "No content available")}</p>
                    <button class="replyBtn mt-4 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                        Reply
                    </button>
                `;

                const replyBtn = card.querySelector('.replyBtn');
                replyBtn.addEventListener('click', () => {
                    openReplyModal(q.email, q.username, q.id);
                });

                container.appendChild(card);
            });

            return fetch('http://localhost:8080/api/questions/pagination/' + (page + 1));
        })
        .then(response => {
            if (!response) return;
            if (!response.ok) throw new Error('HTTP error! Status: ' + response.status);
            return response.json();
        })
        .then(nextPageQuestions => {
            if (!nextPageQuestions) return;
            nextBtn.disabled = nextPageQuestions.length === 0;
            preBtn.disabled = page === 0;
            updatePageDisplay();
        })
        .catch(error => {
            console.error("Error:", error);
            container.innerHTML = '<p>Error loading questions.</p>';
            nextBtn.disabled = true;
        });
}

let selectedEmail = '';
let selectedUsername = '';

function openReplyModal(email, username, questionId) {
    selectedEmail = email;
    selectedUsername = username;
    selectedQuestionId = questionId;
    document.getElementById('replyText').value = '';
    document.getElementById('replyModal').classList.remove('hidden');
}

document.getElementById('cancelBtn').addEventListener('click', () => {
    document.getElementById('replyModal').classList.add('hidden');
});

document.getElementById('sendReplyBtn').addEventListener('click', () => {
    const message = document.getElementById('replyText').value.trim();
    if (!message) return alert('Reply message is empty');

    fetch('http://localhost:8080/api/send-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            to: selectedEmail,
            username: selectedUsername,
            message: message,
            questionId: selectedQuestionId
        })
    }).then(res => {
        if (res.ok) {
            showSuccessMessage('Reply sent successfully!');
            document.getElementById('replyModal').classList.add('hidden');
            loadQuestions(currentQuiz);
        }
        else {
            showErrorMessage('Failed to send reply');
        }
    });
});
