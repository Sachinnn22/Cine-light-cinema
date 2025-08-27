const cardContainer = document.getElementById("card-container");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const pageInfo = document.getElementById("page-info");

const rowsPerPage = 3;
let currentPage = 0;
const pageKeys = [];

function loadInitialPage() {
    db.ref("users")
        .orderByChild('registerTimestamp')
        .limitToFirst(100)
        .once("value", snapshot => {
            let users = [];
            snapshot.forEach(child => {
                const user = { key: child.key, val: child.val() };
                if (user.val.role !== 'admin') {
                    users.push(user);
                }
            });

            const paginatedUsers = users.slice(0, rowsPerPage);
            const hasMore = users.length > rowsPerPage;

            renderUsers(paginatedUsers);

            pageKeys[0] = {
                first: paginatedUsers[0]?.val.registerTimestamp || null,
                last: paginatedUsers[paginatedUsers.length - 1]?.val.registerTimestamp || null
            };

            currentPage = 0;
            updateButtons(hasMore);
        });
}

function goToNextPage() {
    const lastTimestamp = pageKeys[currentPage]?.last;
    if (!lastTimestamp) return;

    db.ref("users")
        .orderByChild('registerTimestamp')
        .startAfter(lastTimestamp)
        .limitToFirst(100)
        .once("value", snapshot => {
            let users = [];
            snapshot.forEach(child => {
                const user = { key: child.key, val: child.val() };
                if (user.val.role !== 'admin') {
                    users.push(user);
                }
            });

            const paginatedUsers = users.slice(0, rowsPerPage);
            const hasMore = users.length > rowsPerPage;

            if (paginatedUsers.length === 0) return;

            currentPage++;
            pageKeys[currentPage] = {
                first: paginatedUsers[0]?.val.registerTimestamp || null,
                last: paginatedUsers[paginatedUsers.length - 1]?.val.registerTimestamp || null
            };

            renderUsers(paginatedUsers);
            updateButtons(hasMore);
        });
}

function goToPreviousPage() {
    if (currentPage <= 0) return;

    const prevPage = currentPage - 1;
    const prevTimestamp = pageKeys[prevPage]?.first;
    if (!prevTimestamp) return;

    db.ref("users")
        .orderByChild('registerTimestamp')
        .startAt(prevTimestamp)
        .limitToFirst(100)
        .once("value", snapshot => {
            let users = [];
            snapshot.forEach(child => {
                const user = { key: child.key, val: child.val() };
                if (user.val.role !== 'admin') {
                    users.push(user);
                }
            });

            const paginatedUsers = users.slice(0, rowsPerPage);
            const hasMore = users.length > rowsPerPage;

            if (paginatedUsers.length === 0) return;

            currentPage--;
            renderUsers(paginatedUsers);
            updateButtons(true);
        });
}

function renderUsers(users) {
    cardContainer.innerHTML = "";

    users.forEach(user => {
        const card = document.createElement("div");
        card.className =
            "bg-white rounded-xl p-8 shadow-lg flex flex-col items-center text-center w-[310px] h-[320px] custom-border";
        card.dataset.key = user.key;
        card.dataset.timestamp = user.val.registerTimestamp;

        card.innerHTML = `
          <img src="${user.val.photoURL}" alt="${user.val.username}" class="w-20 h-20 rounded-full object-cover mb-5 shadow-lg" />
          <h2 class="username">${user.val.username}</h2>
          <p class="email">${user.val.email}</p>
          <p class="text-base text-gray-700">Join Time: ${user.val.registerTime ?? "N/A"}</p>
          <p class="text-base text-gray-700">Join Date: ${user.val.registerDate ?? "N/A"}</p>
        `;
        cardContainer.appendChild(card);
    });

    pageInfo.textContent = `Page ${currentPage + 1}`;
}

function updateButtons(hasMore) {
    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = !hasMore;
}

let currentQuiz = 0;

document.addEventListener('DOMContentLoaded', function () {
    loadQuestions(currentQuiz);
    updatePageDisplay()

    document.getElementById('next').addEventListener('click', function () {
        currentQuiz++;
        loadQuestions(currentQuiz);
        updatePageDisplay()
    });

    document.getElementById('pre').addEventListener('click', function () {
        if (currentQuiz > 0) {
            currentQuiz--;
            loadQuestions(currentQuiz);
            updatePageDisplay()
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
    fetch('http://localhost:8080/api/questions/pagination/' + page)
        .then(response => {
            if (!response.ok) {
                throw new Error('HTTP error! Status: ' + response.status);
            }
            return response.json();
        })
        .then(questions => {
            const container = document.getElementById('questionsContainer');
            const nextBtn = document.getElementById('next');

            container.innerHTML = '';

            if (questions.length === 0) {
                container.innerHTML = '<p>No questions available.</p>';
                nextBtn.disabled = true;
                return;
            }

            nextBtn.disabled = false;

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
                    openReplyModal(q.email, q.username);
                });

                container.appendChild(card);
            });
        })
        .catch(error => {
            console.log("Error:", error);
            const container = document.getElementById('questionsContainer');
            container.innerHTML = '<p>Error loading questions.</p>';
        });
}

let selectedEmail = '';
let selectedUsername = '';

function openReplyModal(email, username) {
    selectedEmail = email;
    selectedUsername = username;
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
            message: message
        })
    }).then(res => {
        if (res.ok) {
            showSuccessMessage('Reply sent successfully!');
            document.getElementById('replyModal').classList.add('hidden');
        } else {
            showErrorMessage('Failed to send reply');
        }
    });
});


function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>"']/g, function(m) {
        return ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[m];
    });
}

window.onload = () => loadQuestions(currentQuiz);

const routes = {
    'Members': 'user-details',
    'View Question': 'questions-list',
    'View Reviews': 'review-list',
    'Adventure': 'action-list'
};

const navLinks = document.querySelectorAll('aside nav a');

navLinks.forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault();

        const linkText = this.textContent.trim();
        const pageId = routes[linkText];
        if (!pageId) return;

        document.querySelectorAll('#content .page').forEach(page => {
            page.style.display = 'none';
        });

        const page = document.getElementById(pageId);
        if (page) {
            page.style.display = 'block';
        }

        if (linkText === 'View Question') {
            currentQuiz = 0;
            loadQuestions(currentQuiz);
            updatePageDisplay();
        }

        window.location.hash = pageId;

        sidebar.classList.add("-translate-x-full");
        overlay.classList.remove("active");
        icon.classList.remove("fa-times", "text-red-600");
        icon.classList.add("fa-bars", "text-gray-600");
    });
});

window.addEventListener('load', () => {
    const hash = window.location.hash.slice(1);
    if (hash && document.getElementById(hash)) {
        document.querySelectorAll('#content .page').forEach(page => page.style.display = 'none');
        document.getElementById(hash).style.display = 'block';
    }
});

const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const icon = menuBtn.querySelector("i");

menuBtn.addEventListener("click", () => {
    const isVisible = !sidebar.classList.contains("-translate-x-full");

    if (isVisible) {
        sidebar.classList.add("-translate-x-full");
        overlay.classList.remove("active");
        icon.classList.remove("fa-times", "text-red-600");
        icon.classList.add("fa-bars", "text-gray-600");
    } else {
        sidebar.classList.remove("-translate-x-full");
        overlay.classList.add("active");
        icon.classList.remove("fa-bars", "text-gray-600");
        icon.classList.add("fa-times", "text-red-600");
    }
});

overlay.addEventListener("click", () => {
    sidebar.classList.add("-translate-x-full");
    overlay.classList.remove("active");
    icon.classList.remove("fa-times", "text-red-600");
    icon.classList.add("fa-bars", "text-gray-600");
});

nextBtn.onclick = goToNextPage;
prevBtn.onclick = goToPreviousPage;

loadInitialPage();

let currentPageReview = 0;
const pageSize = 3;

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

async function fetchPaginatedReviews(page) {
    try {
        const response = await fetch(`http://localhost:8080/api/reviews/paginated?page=${page}&size=${pageSize}`);
        const data = await response.json();

        const container = document.getElementById("review-card-container");
        container.innerHTML = "";

        if (data.length === 0) {
            const noReviewMessage = document.createElement("p");
            noReviewMessage.textContent = "No reviews available.";
            noReviewMessage.style.fontSize = "20px";
            noReviewMessage.style.color = "#666";
            container.appendChild(noReviewMessage);
        } else {
            data.forEach(q => {
                const card = document.createElement("div");
                card.className = "review-card";

                const stars = generateStars(q.rating ?? 0);

                card.innerHTML = `
                    <h2 class="review-card-username">${escapeHtml(q.username ?? "Anonymous")}</h2>
                    <p class="review-card-email">${escapeHtml(q.email ?? "N/A")}</p>
                    <div class="review-card-stars">${stars}</div>
                    <p class="review-card-comment">${escapeHtml(q.comment ?? "No comment available")}</p>
                `;

                container.appendChild(card);
            });
        }

        document.getElementById("currentPageDisplayReview").textContent = `Page ${page + 1}`;

        document.getElementById("pre-review").disabled = page === 0;
        document.getElementById("next-review").disabled = data.length < pageSize;

    } catch (error) {
        console.error("Failed to fetch reviews:", error);
    }
}

document.getElementById("pre-review").addEventListener("click", () => {
    if (currentPageReview > 0) {
        currentPageReview--;
        fetchPaginatedReviews(currentPageReview);
    }
});

document.getElementById("next-review").addEventListener("click", () => {
    currentPageReview++;
    fetchPaginatedReviews(currentPageReview);
});

fetchPaginatedReviews(currentPageReview);
