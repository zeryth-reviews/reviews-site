document.addEventListener("DOMContentLoaded", () => {
    reviewsDB.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (document.getElementById("latest-reviews-grid")) {
        renderHomepageReviews();
    }
    if (document.getElementById("all-categories-list")) {
        renderAllCategoriesList();
    }
    if (document.getElementById("review-main-content")) {
        renderReviewPage();
    }
    if (document.getElementById("category-reviews-grid")) {
        renderCategoryPage();
    }
    if (document.getElementById("archive-list-container")) {
        renderArchivePage();
    }
});

function createReviewCard(review) {
    return `
        <a href="review.html?slug=${review.slug}" class="review-card">
            <div class="card-image-container" style="background-image: url('${review.heroImage}')"></div>
            <div class="card-content">
                <div class="card-category">${review.category}</div>
                <h3 class="card-title">${review.title}</h3>
                <p class="card-summary">${review.summary}</p>
                <div class="card-meta">
                    <span class="card-date">${review.date}</span>
                    <span class="card-rating">${review.rating}</span>
                </div>
            </div>
        </a>
    `;
}


function renderHomepageReviews() {
    const grid = document.getElementById("latest-reviews-grid");
    const searchInput = document.getElementById("search-input");
    const titleElement = document.getElementById("reviews-section-title");

    const displayReviews = (reviewsToDisplay) => {
        if (reviewsToDisplay.length > 0) {
            grid.innerHTML = reviewsToDisplay.map(createReviewCard).join("");
        } else {
            grid.innerHTML = `<p class="no-results">No reviews found matching your search.</p>`;
        }
    };

    const topSixReviews = reviewsDB.slice(0, 6);
    displayReviews(topSixReviews);

    searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();

        if (searchTerm === "") {
            titleElement.textContent = "Latest Reviews";
            displayReviews(topSixReviews);
            return;
        }

        const filteredReviews = reviewsDB.filter(review =>
            review.title.toLowerCase().includes(searchTerm) ||
            review.summary.toLowerCase().includes(searchTerm)
        );

        titleElement.textContent = "Search Results";
        displayReviews(filteredReviews);
    });
}

function renderAllCategoriesList() {
    const container = document.getElementById('all-categories-list');
    const categories = [...new Set(reviewsDB.map(r => r.category))].sort(); 
    const categoryLinks = categories.map(cat => `<li><a href="category.html?name=${cat}">${cat}</a></li>`).join('');
    container.innerHTML = categoryLinks;
}

function renderArchivePage() {
    const sortSelect = document.getElementById('sort-select');
    const categoryFilter = document.getElementById('category-filter');
    const container = document.getElementById('archive-list-container');
    const allCategories = [...new Set(reviewsDB.map(r => r.category))].sort();

    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    categoryFilter.innerHTML += allCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('');

    const updateArchiveList = () => {
        let displayedReviews = [...reviewsDB];
        const sortBy = sortSelect.value;
        const category = categoryFilter.value;

        if (category !== 'all') {
            displayedReviews = displayedReviews.filter(r => r.category === category);
        }

        switch (sortBy) {
            case 'date-asc':
                displayedReviews.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'title-asc':
                displayedReviews.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'date-desc':
            default:
                displayedReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
        }

        if (displayedReviews.length > 0) {
            const listHtml = displayedReviews.map(review => `
                <a href="review.html?slug=${review.slug}" class="archive-list-item">
                    <div class="item-details">
                        <span class="item-title">${review.title}</span>
                        <span class="item-category">${review.category}</span>
                    </div>
                    <span class="item-date">${review.date}</span>
                </a>
            `).join('');
            container.innerHTML = `<div class="archive-list">${listHtml}</div>`;
        } else {
            container.innerHTML = `<p class="no-results">No reviews found for this category.</p>`;
        }
    };

    sortSelect.addEventListener('change', updateArchiveList);
    categoryFilter.addEventListener('change', updateArchiveList);

    updateArchiveList();
}


async function renderReviewPage() {
    const mainContent = document.getElementById('review-main-content');
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    const review = reviewsDB.find(r => r.slug === slug);

    if (!review) {
        mainContent.innerHTML = `<div class="container narrow"><p>Review not found. Return to <a href="index.html">homepage</a>.</p></div>`;
        return;
    }
    
    document.title = `${review.title} - Zeryth Reviews`;
    const metaDesc = document.createElement('meta');
    metaDesc.name = "description";
    metaDesc.content = review.summary;
    document.head.appendChild(metaDesc);

    try {
        const response = await fetch(`reviews/${review.slug}.md`);
        if (!response.ok) throw new Error(`Markdown file not found at reviews/${review.slug}.md`);
        const markdown = await response.text();
        const contentHtml = marked.parse(markdown);

        const reviewHtml = `
            <header class="review-header">
                <div class="container">
                    <a href="category.html?name=${review.category}" class="card-category">${review.category}</a>
                    <h1 class="review-title">${review.title}</h1>
                    <div class="review-meta">
                        <div>By <span>${review.author}</span></div>
                        <div>Published on <span>${review.date}</span></div>
                        <div>Rating: <span>${review.rating}</span></div>
                    </div>
                </div>
            </header>
            <article class="review-content container narrow">
                <img src="${review.heroImage}" alt="${review.title}" class="review-hero-image">
                ${contentHtml}
            </article>
        `;
        mainContent.innerHTML = reviewHtml;
    } catch (error) {
        console.error('Error fetching review:', error);
        mainContent.innerHTML = `<div class="container narrow"><p>Error loading review content. Please check that the file exists and the slug in reviews-db.js is correct.</p></div>`;
    }
}

function renderCategoryPage() {
    const params = new URLSearchParams(window.location.search);
    const categoryName = params.get('name');

    document.title = `${categoryName} Reviews - Zeryth Reviews`;
    document.getElementById('category-title').textContent = `${categoryName} Reviews`;

    const grid = document.getElementById('category-reviews-grid');
    const filteredReviews = reviewsDB.filter(r => r.category === categoryName);

    if (filteredReviews.length > 0) {
        grid.innerHTML = filteredReviews.map(createReviewCard).join('');
    } else {
        grid.innerHTML = `<p>No reviews found in this category. Why not <a href="index.html">browse all reviews</a>?</p>`;
    }
}