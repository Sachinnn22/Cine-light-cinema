document.getElementById('dropdownToggle').addEventListener('click', () => {
    const dropdown = document.getElementById('mainDropdown');
    dropdown.classList.toggle('open');
});

document.getElementById('userToggle').addEventListener('click', () => {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('open');
});

document.getElementById('mobileUserToggle')?.addEventListener('click', () => {
    const menu = document.getElementById('mobileUserMenu');
    if (menu) menu.classList.toggle('hidden');
});

const mobileMenu = document.getElementById('mobile-menu');
const menuToggle = document.getElementById('menu-toggle');

document.querySelectorAll('.mobile-menu-link').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.style.maxHeight = '0';
        menuToggle.classList.remove('open', 'active', 'menu-open');

        const menuIcon = menuToggle.querySelector('svg');
        if (menuIcon) {
            menuIcon.innerHTML = `
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16" />
        `;
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('menu-toggle');
    const menu = document.getElementById('mobile-menu');
    let menuOpen = false;

    toggleBtn.addEventListener('click', () => {
        const submenu = document.getElementById('mobileMoviesSubmenu');
        const userMenu = document.getElementById('mobileUserMenu');
        const mobileSearchContainer = document.getElementById('mobile-search-container');
        const mobileSearchInput = document.getElementById('mobile-search-input');

        if (menuOpen) {
            menu.style.maxHeight = '0px';
            menuOpen = false;
            toggleBtn.innerHTML = `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        `;
        } else {
            if (!mobileSearchContainer.classList.contains('hidden')) {
                mobileSearchContainer.classList.add('hidden');
                if (mobileSearchInput) mobileSearchInput.value = '';
            }

            const originallyHidden = [];
            [submenu, userMenu].forEach(el => {
                if (el && el.classList.contains('hidden')) {
                    el.classList.remove('hidden');
                    originallyHidden.push(el);
                }
            });

            requestAnimationFrame(() => {
                const fullHeight = menu.scrollHeight + 50;
                originallyHidden.forEach(el => el.classList.add('hidden'));

                menu.style.maxHeight = fullHeight + 'px';
                menuOpen = true;

                toggleBtn.innerHTML = `
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            `;
            });
        }
    });
});

const notificationBtn = document.getElementById('notificationBtn');
const notificationPopup = document.getElementById('notificationPopup');

if (notificationBtn && notificationPopup) {
    notificationBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (notificationPopup.classList.contains('show')) {
            notificationPopup.classList.remove('show');
            notificationPopup.classList.add('hidden');
        } else {
            notificationPopup.classList.add('show');
            notificationPopup.classList.remove('hidden');
        }
    });

    const notifBtn = document.getElementById("notifBtn");
    const notifPopup = document.getElementById("mobile-notificationPopup");
    const bellIcon = document.getElementById("bellIcon");
    const removeIcon = document.getElementById("closeIcon");

    notifBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isHidden = notifPopup.classList.toggle("hidden");

        bellIcon.classList.toggle("opacity-0", !isHidden);
        bellIcon.classList.toggle("pointer-events-none", !isHidden);

        removeIcon.classList.toggle("opacity-0", isHidden);
        removeIcon.classList.toggle("pointer-events-none", isHidden);
    });

    document.addEventListener("click", () => {
        notifPopup.classList.add("hidden");

        bellIcon.classList.remove("opacity-0");
        bellIcon.classList.remove("pointer-events-none");

        removeIcon.classList.add("opacity-0");
        removeIcon.classList.add("pointer-events-none");
    });

    notifPopup.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    searchToggle.addEventListener('click', () => {
        if (searchInput.classList.contains('show')) {
            searchInput.classList.remove('show');
            searchInput.classList.add('hidden');
            searchInput.value = '';
            searchInput.blur();
            searchResultsPanel.classList.remove('show');
            searchResultsPanel.innerHTML = '';
        } else {
            searchInput.classList.add('show');
            searchInput.classList.remove('hidden');
            searchInput.focus();
        }
    });

    searchInput.addEventListener('input', async () => {
        const keyword = searchInput.value.trim();
        if (keyword.length === 0) {
            searchResultsPanel.classList.remove('show');
            searchResultsPanel.innerHTML = '';
            return;
        }

        try {
            // Use your Spring Boot API parameters (keyword, page=0, size=9)
            const res = await fetch(`http://localhost:8080/api/movies/search?keyword=${encodeURIComponent(keyword)}&page=0&size=9`);
            if (!res.ok) throw new Error('Network response was not ok');

            const movies = await res.json();
            renderSearchResults(movies);
        } catch (err) {
            console.error('Search failed:', err);
        }
    });

    function renderSearchResults(movies) {
        searchResultsPanel.innerHTML = '';

        if (movies.length === 0) {
            searchResultsPanel.innerHTML = '<p class="text-white text-sm">No movies found ?</p>';
        } else {
            const limitedMovies = movies.slice(0, 9);

            limitedMovies.forEach(movie => {
                const card = `
<article class="flex w-full bg-[#1c1c1c] rounded-2xl overflow-hidden text-white border-2 border-gray-300 shadow-xl p-2 mb-3 disabled-card">
    <img src="http://localhost:8080/uploads/${movie.imagePath}" alt="${movie.name}" class="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
    <div class="ml-6 flex flex-col justify-center">
        <h3 class="font-semibold text-[18px]">${movie.name}</h3>
        <p class="text-green-400 mt-0.5 font-medium text-xs">${movie.category}</p>
        <p class="text-gray-400 mt-0.5 text-xs">${movie.releaseDate}</p>
    </div>
</article>`;
                searchResultsPanel.innerHTML += card;
            });

            const advancedSearchBtn = `
<div class="flex justify-center mt-2">
  <button id="advancedSearchBtn" 
    class="bg-green-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md flex items-center gap-2 disabled-btn"
    disabled
  >
    <i class="fas fa-search"></i>
    Enhanced Search
  </button>
</div>`;
            searchResultsPanel.innerHTML += advancedSearchBtn;
        }

        searchResultsPanel.classList.add('show');
    }


    const searchToggleMobile = document.getElementById('search-toggle-mobile');
    const searchIcon = document.getElementById('search-icon');
    const closeIcon = document.getElementById('close-icon');

    searchToggleMobile.addEventListener('click', () => {
        searchIcon.classList.toggle('hidden');
        closeIcon.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!notificationPopup.contains(e.target) && !notificationBtn.contains(e.target)) {
            notificationPopup.classList.remove('show');
            notificationPopup.classList.add('hidden');
        }
    });
}

const mobileSearchToggle = document.getElementById('search-toggle-mobile');
const mobileSearchContainer = document.getElementById('mobile-search-container');
const mobileSearchInput = document.getElementById('mobile-search-input');
const mobileSearchResultsPanel = document.getElementById('mobile-search-results-panel');

let mobileSearchOpen = false;

mobileSearchToggle.addEventListener('click', () => {
    if (!mobileSearchContainer) return;

    if (!mobileSearchContainer.classList.contains('hidden')) {
        mobileSearchContainer.classList.add('hidden');
        mobileSearchInput.value = '';
        mobileSearchInput.blur();

        mobileSearchResultsPanel.classList.add('hidden');
        mobileSearchResultsPanel.innerHTML = '';

        mobileSearchOpen = false;
    } else {
        mobileSearchContainer.classList.remove('hidden');
        mobileSearchInput.focus();

        mobileSearchOpen = true;
    }
});

mobileSearchInput.addEventListener('input', async () => {
    const query = mobileSearchInput.value.trim();

    if (query.length === 0) {
        mobileSearchResultsPanel.classList.add('hidden');
        mobileSearchResultsPanel.innerHTML = '';
        return;
    }

    try {
        const res = await fetch(`http://localhost:8080/api/movies/search?query=${encodeURIComponent(query)}&limit=false`);
        const movies = await res.json();
        renderMobileSearchResults(movies);
    } catch (err) {
        console.error('Mobile search failed:', err);
        mobileSearchResultsPanel.classList.add('hidden');
        mobileSearchResultsPanel.innerHTML = '<p class="text-white text-sm">Search failed. Please try again.</p>';
    }
});

function renderMobileSearchResults(movies) {
    mobileSearchResultsPanel.innerHTML = '';

    if (movies.length === 0) {
        mobileSearchResultsPanel.innerHTML = '<p class="text-white text-sm">No movies found.</p>';
    } else {
        const limitedMovies = movies.slice(0, 2);

        limitedMovies.forEach(movie => {
                const card = `
    <article class="w-64 mx-auto mt-3 bg-[#1c1c1c] rounded-lg overflow-hidden text-white border border-gray-600 shadow p-3 flex mb-2">
      <img src="${movie.imageUrl}" alt="${movie.title}" class="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
      <div class="ml-4 flex flex-col justify-center">
        <h3 class="font-semibold text-md">${movie.title}</h3>
        <p class="text-green-400 text-xs mt-0.5 font-medium">${movie.genre}</p>
        <p class="text-gray-400 text-xs mt-0.5">${movie.releaseDate}</p>
      </div>
    </article>`;

            mobileSearchResultsPanel.innerHTML += card;
        });

            const advancedSearchBtn = `
    <div class="flex justify-center mt-3">
      <button id="mobileAdvancedSearchBtn" 
        onclick="window.location.href='../all-movie.html'"
        class="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-colors duration-300 flex items-center gap-2">
        <i class="fas fa-search"></i>
        Enhanced Search
      </button>
    </div>`;
        mobileSearchResultsPanel.innerHTML += advancedSearchBtn;
    }

    mobileSearchResultsPanel.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', function () {
    const toggle = document.getElementById('mobileMoviesToggle');
    const submenu = document.getElementById('mobileMoviesSubmenu');
    const arrow = document.getElementById('mobileMoviesArrow');

    toggle.addEventListener('click', function () {
        submenu.classList.toggle('hidden');
        arrow.classList.toggle('rotate-180');
    });
});

const newReleaseLock = document.getElementById('newReleaseLock');
const premiumToast = document.getElementById('premiumToast');

newReleaseLock.addEventListener('click', (e) => {
    e.preventDefault();
    if (!premiumToast.classList.contains('show')) {
        premiumToast.classList.add('show');
        setTimeout(() => {
            premiumToast.classList.remove('show');
        }, 3000);
    }
});

document.querySelectorAll('.movieLock.disabled-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();

        const toast = document.getElementById('premiumToast');

        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    });
});