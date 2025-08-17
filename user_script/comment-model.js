const stars = document.querySelectorAll('#starRating i');
let selectedRating = 0;

stars.forEach((star, idx) => {
    star.addEventListener('mouseover', () => {
        resetStars();
        highlightStars(idx);
    });

    star.addEventListener('mouseout', () => {
        resetStars();
        if (selectedRating > 0) {
            highlightStars(selectedRating - 1);
        }
    });

    star.addEventListener('click', () => {
        selectedRating = idx + 1;
        resetStars();
        highlightStars(idx);
        star.classList.add('selected');
    });
});

function resetStars() {
    stars.forEach(star => star.classList.remove('hovered', 'selected'));
}

function highlightStars(index) {
    for (let i = 0; i <= index; i++) {
        stars[i].classList.add('hovered');
    }
}

async function submitReview() {
    const comment = document.getElementById('commentInput').value.trim();

    if (selectedRating === 0 || comment === "") {
        showErrorMessage("Please select a star rating and write a comment.");
        return;
    }

    const user = auth.currentUser;
    if (!user) {
        showErrorMessage("You must be logged in to submit a review.");
        return;
    }

    const reviewData = {
        rating: selectedRating,
        comment: comment,
        email: user.email,
        username: user.displayName || "Anonymous"
    };

    try {
        const response = await fetch("http://localhost:8080/api/reviews", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(reviewData)
        });

        if (response.ok) {
            showSuccessMessage("Review submitted successfully!");
            document.getElementById("reviewModal").close();
            selectedRating = 0;
            resetStars();
            document.getElementById('commentInput').value = "";
        } else {
            showErrorMessage("Error submitting review.");
        }

    } catch (err) {
        console.error("Submit error:", err);
        showErrorMessage("Something went wrong.");
    }
}

document.getElementById('submitReviewBtn').addEventListener('click', submitReview);

function showErrorMessage(message) {
    const existing = document.getElementById('floating-error');
    if (existing) existing.remove();

    const errorElement = document.createElement('div');
    errorElement.id = 'floating-error';
    errorElement.innerHTML = `
        <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            color: white;
            background-color: #dc2626;
            border-radius: 0.75rem;
            padding: 0.5rem 1rem;
        ">
        <i class="fas fa-info-circle" style="font-size: 1rem; margin-right: 0.5rem;"></i>
            <span style="font-weight: 500;">${message}</span>
        </div>
    `;

    errorElement.style.position = 'fixed';
    errorElement.style.top = '5.5rem';
    errorElement.style.left = '50%';
    errorElement.style.transform = 'translateX(-50%) translateY(-20px)';
    errorElement.style.zIndex = '100000';
    errorElement.style.width = '460px';
    errorElement.style.maxWidth = '90%';
    errorElement.style.textAlign = 'center';
    errorElement.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
    errorElement.style.opacity = '0';
    errorElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    document.body.appendChild(errorElement);

    requestAnimationFrame(() => {
        errorElement.style.opacity = '1';
        errorElement.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
        errorElement.style.opacity = '0';
        errorElement.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => {
            errorElement.remove();
        }, 500);
    }, 4000);
}

function showSuccessMessage(message) {
    const existing = document.getElementById('floating-success');
    if (existing) existing.remove();

    const successElement = document.createElement('div');
    successElement.id = 'floating-success';

    successElement.innerHTML = `
        <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            color: white;
            background-color: #16a34a;
            border-radius: 0.75rem;
            padding: 0.5rem 1rem;
        ">
            <i class="fas fa-check-circle" style="font-size: 1rem; margin-right: 0.6rem;"></i>
            <span style="font-weight: 500;">${message}</span>
        </div>
    `;

    successElement.style.position = 'fixed';
    successElement.style.top = '5.5rem';
    successElement.style.left = '50%';
    successElement.style.transform = 'translateX(-50%) translateY(-20px)';
    successElement.style.zIndex = '9999';
    successElement.style.width = '460px';
    successElement.style.maxWidth = '90%';
    successElement.style.textAlign = 'center';
    successElement.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
    successElement.style.opacity = '0';
    successElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    document.body.appendChild(successElement);

    requestAnimationFrame(() => {
        successElement.style.opacity = '1';
        successElement.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
        successElement.style.opacity = '0';
        successElement.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => {
            successElement.remove();
        }, 500);
    }, 4000);
}
