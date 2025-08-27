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