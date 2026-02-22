const BASE_URL = import.meta.env.VITE_API_URL;
const CONFIG = {
    API_URL: `${BASE_URL}/api/v1/reviews`
};

const url = new URL(location.href);
const movieId = url.searchParams.get("id");
const movieTitle = url.searchParams.get("title");

if (!movieId || !movieTitle) {
    console.error('Missing required URL parameters: id and title');
    document.body.innerHTML = '<p>Chyba: Chybějí povinné parametry</p>';
}

const main = document.getElementById("section");
const title = document.getElementById("title");

if (title) {
    title.innerText = movieTitle;
}

function init() {
    renderNewReviewForm();
    loadReviews();
}

function renderNewReviewForm() {
    const container = document.createElement('div');
    container.className = 'row';
    
    const column = document.createElement('div');
    column.className = 'column';
    
    const card = document.createElement('div');
    card.className = 'card';
    
    const title = document.createElement('h3');
    title.textContent = 'Nová recenze';
    
    const reviewLabel = document.createElement('label');
    reviewLabel.innerHTML = '<strong>Recenze: </strong>';
    const reviewInput = document.createElement('input');
    reviewInput.type = 'text';
    reviewInput.id = 'new_review';
    reviewInput.placeholder = 'Napište vaši recenzi...';
    
    const userLabel = document.createElement('label');
    userLabel.innerHTML = '<strong>Jméno: </strong>';
    const userInput = document.createElement('input');
    userInput.type = 'text';
    userInput.id = 'new_user';
    userInput.placeholder = 'Vaše jméno...';
    
    const saveBtn = document.createElement('button');
    saveBtn.textContent = '💾 Uložit';
    saveBtn.addEventListener('click', () => saveReview('new_review', 'new_user'));
    
    card.appendChild(title);
    card.appendChild(reviewLabel);
    card.appendChild(reviewInput);
    card.appendChild(userLabel);
    card.appendChild(userInput);
    card.appendChild(saveBtn);
    
    column.appendChild(card);
    container.appendChild(column);
    main.appendChild(container);
}

async function loadReviews() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/movie/${movieId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const reviews = await response.json();
        
        if (!Array.isArray(reviews)) {
            console.error('Neočekávaný formát API odpovědi');
            return;
        }
        
        reviews.forEach(review => {
            renderReviewCard(review);
        });
    } catch (error) {
        console.error('Chyba při načítání recenzí:', error);
        showError('Nepodařilo se načíst recenze');
    }
}

/*
 @param {Object} review - Review object with _id, review, user properties
 */
function renderReviewCard(review) {
    const container = document.createElement('div');
    container.className = 'row';
    container.id = `review-container-${review._id}`;
    
    const column = document.createElement('div');
    column.className = 'column';
    
    const card = document.createElement('div');
    card.className = 'card';
    card.id = review._id;
    
    const reviewPara = document.createElement('p');
    reviewPara.innerHTML = '<strong>Recenze: </strong>';
    const reviewText = document.createElement('span');
    reviewText.textContent = review.review;
    reviewPara.appendChild(reviewText);
    
    const userPara = document.createElement('p');
    userPara.innerHTML = '<strong>Uživatel: </strong>';
    const userText = document.createElement('span');
    userText.textContent = review.user;
    userPara.appendChild(userText);
    
    const actionsPara = document.createElement('p');
    
    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️ Upravit';
    editBtn.addEventListener('click', () => startEditReview(review._id, review.review, review.user));
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️ Smazat';
    deleteBtn.addEventListener('click', () => deleteReview(review._id));
    
    actionsPara.appendChild(editBtn);
    actionsPara.appendChild(deleteBtn);
    
    card.appendChild(reviewPara);
    card.appendChild(userPara);
    card.appendChild(actionsPara);
    
    column.appendChild(card);
    container.appendChild(column);
    main.appendChild(container);
}

/*
 * Switch review to edit mode
 * @param {string} reviewId - Review ID
 * @param {string} review - Current review text
 * @param {string} user - Current user name
 */
function startEditReview(reviewId, review, user) {
    const card = document.getElementById(reviewId);
    if (!card) return;
    
    const reviewInputId = `review_${reviewId}`;
    const userInputId = `user_${reviewId}`;
    
    card.innerHTML = '';
    
    const reviewLabel = document.createElement('label');
    reviewLabel.innerHTML = '<strong>Recenze: </strong>';
    const reviewInput = document.createElement('input');
    reviewInput.type = 'text';
    reviewInput.id = reviewInputId;
    reviewInput.value = review;
    
    const userLabel = document.createElement('label');
    userLabel.innerHTML = '<strong>Jméno: </strong>';
    const userInput = document.createElement('input');
    userInput.type = 'text';
    userInput.id = userInputId;
    userInput.value = user;
    
    const saveBtn = document.createElement('button');
    saveBtn.textContent = '💾 Uložit';
    saveBtn.addEventListener('click', () => saveReview(reviewInputId, userInputId, reviewId));
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '❌ Zrušit';
    cancelBtn.addEventListener('click', () => location.reload());
    
    card.appendChild(reviewLabel);
    card.appendChild(reviewInput);
    card.appendChild(userLabel);
    card.appendChild(userInput);
    card.appendChild(saveBtn);
    card.appendChild(cancelBtn);
}

/**
 * Save review (create or update)
 * @param {string} reviewInputId - Review input element ID
 * @param {string} userInputId - User input element ID
 * @param {string} id - Review ID (empty for new reviews)
 */
async function saveReview(reviewInputId, userInputId, id = "") {
    try {
        const reviewInput = document.getElementById(reviewInputId);
        const userInput = document.getElementById(userInputId);
        
        if (!reviewInput || !userInput) {
            console.error('Nelze najít input prvky');
            return;
        }
        
        const reviewText = reviewInput.value.trim();
        const userName = userInput.value.trim();
        
        // Validation
        if (!reviewText || !userName) {
            showError('Prosím, vyplňte všechna pole');
            return;
        }
        
        if (reviewText.length > 500) {
            showError('Recenze nesmí být delší než 500 znaků');
            return;
        }
        
        if (userName.length > 100) {
            showError('Jméno nesmí být delší než 100 znaků');
            return;
        }
        
        const method = id ? 'PUT' : 'POST';
        const endpoint = id ? `${CONFIG.API_URL}/${id}` : `${CONFIG.API_URL}/new`;
        const body = id 
            ? { user: userName, review: reviewText }
            : { movieId: Number(movieId), user: userName, review: reviewText };
        
        const response = await fetch(endpoint, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        location.reload();
    } catch (error) {
        console.error('Chyba při ukládání recenze:', error);
        showError('Nepodařilo se uložit recenzi');
    }
}

/**
 * Delete review
 * @param {string} id - Review ID
 */
async function deleteReview(id) {
    if (!confirm('Opravdu chcete smazat tuto recenzi?')) {
        return;
    }
    
    try {
        const response = await fetch(`${CONFIG.API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        await response.json();
        location.reload();
    } catch (error) {
        console.error('Chyba při mazání recenze:', error);
        showError('Nepodařilo se smazat recenzi');
    }
}

/**
 * @param {string} message - Error message
 */
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'color: red; padding: 10px; margin: 10px 0; background-color: #ffe6e6; border-radius: 4px;';
    errorDiv.textContent = message;
    main.insertBefore(errorDiv, main.firstChild);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}


