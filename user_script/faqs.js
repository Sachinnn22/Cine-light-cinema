document.getElementById("questionForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const input = document.getElementById("questionInput");
    const question = input.value.trim();

    if (!question) {
        showErrorMessage("Please enter a question.");
        return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        showErrorMessage("You must be logged in to submit a question.");
        return;
    }

    const email = user.email;
    const username = user.username || "Anonymous";

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8080/api/questions", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 201) {
                showSuccessMessage("Question submitted successfully!");
                input.value = "";
            } else {
                showErrorMessage("Error: " + xhr.responseText);
            }
        }
    };

    xhr.send(JSON.stringify({ content: question, email: email, username: username }));
});

function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}