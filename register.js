// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyCNH38ylbzfIORN0wmDoizj_eWKunQ1uAQ",
    authDomain: "my-first-app-6a293.firebaseapp.com",
    databaseURL: "https://my-first-app-6a293-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "my-first-app-6a293",
    storageBucket: "my-first-app-6a293.firebasestorage.app",
    messagingSenderId: "599546991663",
    appId: "1:599546991663:web:b07d25c55f1d00c06722da",
    measurementId: "G-5EVKKY7KLP"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// -------------------------
// 🔐 LOGIN FUNCTIONALITY
// -------------------------
document.querySelector('.front form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('name').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
        showErrorMessage('❗ Username and password are required.');
        return;
    }

    try {
        // Step 1: Find the user by username
        const snapshot = await db.ref('users').orderByChild('username').equalTo(username).once('value');

        if (!snapshot.exists()) {
            showErrorMessage('❌ Username not found. Please register first.');
            return;
        }

        let email = null;

        snapshot.forEach(userSnap => {
            const data = userSnap.val();
            if (data && data.email && typeof data.email === 'string') {
                email = data.email.trim().toLowerCase();
            }
        });

        // Validate email before using it
        if (!email || !email.includes('@')) {
            showErrorMessage('⚠️ No valid email found for this username. Please contact support.');
            return;
        }

        // Step 2: Login with email and password
        const cred = await auth.signInWithEmailAndPassword(email, password);

        // ✅ Login successful
        // ✅ Login successful
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } catch (err) {
        const code = err.code;

        if (code === 'auth/too-many-requests') {
            showErrorMessage('🚫 Too many login attempts. Please wait a few minutes and try again.');
        } else if (code === 'auth/wrong-password' || code === 'auth/invalid-login-credentials') {
            showErrorMessage('🔒 Incorrect password. Please try again.');
        } else if (code === 'auth/user-not-found') {
            showErrorMessage('❌ Account not found. Please register.');
        } else if (code === 'auth/invalid-email') {
            showErrorMessage('⚠️ Invalid email format.');
        } else if (code === 'auth/network-request-failed') {
            showErrorMessage('⚠️ Network error. Please check your connection.');
        } else {
            showErrorMessage(`⚠️ Login error: ${err.message}`);
        }

        console.error("Firebase login error:", code, err.message);
    }


});

// 🔁 TOGGLE LOGIN/REGISTER FORM
function toggleFlip() {
    document.getElementById('flip-container').classList.toggle('flip');
}

function showErrorMessage(message) {
    const existing = document.getElementById('floating-error');
    if (existing) existing.remove();

    const errorElement = document.createElement('div');
    errorElement.id = 'floating-error';
    errorElement.textContent = message;

    errorElement.classList.add(
        'fixed', 'top-20', 'inset-x-0', 'mx-auto',
        'bg-red-600', 'text-white', 'px-6', 'py-3',
        'rounded', 'shadow-lg', 'z-[9999]', 'w-[450px]', 'text-sm', 'text-center',
        'fade-in-down'
    );

    document.body.appendChild(errorElement);

    setTimeout(() => {
        errorElement.classList.remove('fade-in-down');
        errorElement.classList.add('fade-out-up');
        setTimeout(() => {
            errorElement.remove();
        }, 500); // Duration of fade-out
    }, 4000); // Start fade-out after 4s
}


function showSuccessMessage(message) {
    const existing = document.getElementById('floating-success');
    if (existing) existing.remove();

    const successElement = document.createElement('div');
    successElement.id = 'floating-success';
    successElement.textContent = message;

    successElement.classList.add(
        'fixed', 'top-20', 'left-1/2', '-translate-x-1/2',
        'bg-green-600', 'text-white', 'px-6', 'py-3',
        'rounded', 'shadow-lg', 'z-[9999]', 'w-[450px]', 'text-sm', 'text-center',
        'fade-in-down'
    );

    document.body.appendChild(successElement);

    setTimeout(() => {
        successElement.classList.remove('fade-in-down');
        successElement.classList.add('fade-out-up');
        setTimeout(() => {
            successElement.remove();
        }, 500);
    }, 4000);
}

// -------------------------
// 📄 REGISTER FUNCTIONALITY
// -------------------------

// -------------------------
// 🔁 TOGGLE LOGIN/REGISTER FORM
// -------------------------
function toggleFlip() {
    document.getElementById('flip-container').classList.toggle('flip');
}

// -------------------------
// ⚠️ SHOW ERROR MESSAGE
// -------------------------


// Register form submit handler
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('register-email').value.trim().toLowerCase();
    const password = document.getElementById('register-password').value;

    if (!username || !email || !password) {
        showErrorMessage('❗ All fields are required.');
        return;
    }

    const usernameRegex = /^[a-zA-Z0-9]{3,}$/;
    if (!usernameRegex.test(username)) {
        showErrorMessage('❗ Username must be at least 3 characters and contain only letters or numbers.');
        return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(password)) {
        showErrorMessage('🔒 Password must be at least 6 characters and include letters and numbers.');
        return;
    }

    try {
        // Check if username already exists
        const snapshot = await db.ref('users').orderByChild('username').equalTo(username).once('value');
        if (snapshot.exists()) {
            showErrorMessage('❌ Username already taken. Please choose another.');
            return;
        }

        // Create user in Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const uid = userCredential.user.uid;

        // Get current time & date
        const now = new Date();
        const registerDate = now.toISOString().slice(0, 10);  // YYYY-MM-DD
        const registerTime = now.toTimeString().slice(0, 5);  // HH:mm

        // Save user data in Realtime Database
        await db.ref('users/' + uid).set({
            username: username,
            email: email,
            photoURL: `https://api.dicebear.com/6.x/adventurer/svg?seed=${uid}`,
            registerDate: registerDate,
            registerTime: registerTime
        });

        showSuccessMessage('✅ Registration successful! Please login now.');
        toggleFlip();  // Show login form
        document.getElementById('registerForm').reset();

    } catch (err) {
        console.error("Registration error:", err);
        if (err.code === 'auth/email-already-in-use') {
            showErrorMessage('❌ Email is already in use. Please login or use another email.');
        } else if (err.code === 'auth/weak-password') {
            showErrorMessage('❗ Password is too weak. Please choose a stronger password.');
        } else {
            showErrorMessage(`⚠️ Registration error: ${err.message}`);
        }
    }
});

// -------------------------
// 🔐 GOOGLE LOGIN
// -------------------------
document.getElementById('googleSignInBtn').addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .then(result => {
            const user = result.user;
            alert(`✅ Hello, ${user.displayName}! Login Successful!`);

            // Save user photoURL to Realtime Database (optional)
            const dbRef = firebase.database().ref('users/' + user.uid);
            dbRef.set({
                username: user.displayName,
                email: user.email,
                photoURL: user.photoURL // Save photo URL
            });

            // Optionally redirect
            window.location.href = 'index.html';
        })
        .catch(error => {
            console.error("Google Sign-In Error:", error.message);
            alert(`⚠️ Google Sign-In Error: ${error.message}`);
        });
});

function forgotPassword() {
    document.getElementById("forgotPasswordModal").classList.remove("hidden");
}

function closeForgotModal() {
    document.getElementById("forgotPasswordModal").classList.add("hidden");
    document.getElementById("resetEmail").value = '';
}

async function sendResetEmail() {
    const email = document.getElementById("resetEmail").value.trim().toLowerCase();

    if (!email || !email.includes("@")) {
        showErrorMessage("⚠️ Please enter a valid email address.");
        return;
    }

    try {
        await firebase.auth().sendPasswordResetEmail(email);
        showSuccessMessage("📧 Password reset email sent! Please check your inbox.");
        closeForgotModal();
    } catch (error) {
        console.error("Reset email error:", error);
        if (error.code === 'auth/user-not-found') {
            showErrorMessage("❌ No account found with this email.");
        } else if (error.code === 'auth/invalid-email') {
            showErrorMessage("⚠️ Invalid email format.");
        } else {
            showErrorMessage(`⚠️ Error: ${error.message}`);
        }
    }
}