//firbase config start
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

document.querySelector('.front form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('name').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
        showErrorMessage('Username and password are required.');
        return;
    }

    try {
        const snapshot = await db.ref('users').orderByChild('username').equalTo(username).once('value');

        if (!snapshot.exists()) {
            showErrorMessage('Username not found. Please register first.');
            return;
        }

        let email = null;

        snapshot.forEach(userSnap => {
            const data = userSnap.val();
            if (data && data.email && typeof data.email === 'string') {
                email = data.email.trim().toLowerCase();
            }
        });

        if (!email || !email.includes('@')) {
            showErrorMessage('No valid email found for this username.');
            return;
        }

        const cred = await auth.signInWithEmailAndPassword(email, password);

        const user = cred.user;

        const idToken = await user.getIdToken();

        console.log('Firebase ID Token:', idToken);

        document.cookie = `firebaseToken=${idToken}; path=/; Secure; SameSite=Strict; max-age=3600`;

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } catch (err) {
        const code = err.code;

        if (code === 'auth/too-many-requests') {
            showErrorMessage('Too many attempts please wait');
        } else if (code === 'auth/wrong-password' || code === 'auth/invalid-login-credentials') {
            showErrorMessage('Incorrect password. Please try again.');
        } else if (code === 'auth/user-not-found') {
            showErrorMessage('Account not found. Please register.');
        } else if (code === 'auth/invalid-email') {
            showErrorMessage('Invalid email format.');
        } else if (code === 'auth/network-request-failed') {
            showErrorMessage('Network error. Please check your connection.');
        } else {
            showErrorMessage(`Login error: ${err.message}`);
        }

        console.error("Firebase login error:", code, err.message);
    }
});

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
    errorElement.style.top = '5.8rem';
    errorElement.style.left = '50%';
    errorElement.style.transform = 'translateX(-50%) translateY(-20px)';
    errorElement.style.zIndex = '9999';
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
    successElement.style.top = '5.8rem';
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

const toggleBtns = document.querySelectorAll('.re-togglePassword');

toggleBtns.forEach(toggleBtn => {
    const passwordInput = toggleBtn.previousElementSibling;
    const icon = toggleBtn.querySelector('i');

    toggleBtn.addEventListener('click', () => {
        if (!passwordInput) return;

        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';

        icon.classList.toggle('fa-eye-slash');
        icon.classList.toggle('fa-eye');
    });
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('register-email').value.trim().toLowerCase();
    const password = document.getElementById('register-password').value;

    if (!username || !email || !password) {
        showErrorMessage('All fields are required.');
        return;
    }

    const usernameRegex = /^[a-zA-Z0-9]{3,}$/;
    if (!usernameRegex.test(username)) {
        showErrorMessage('Username need at least 3 letters or numbers only');
        return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(password)) {
        showErrorMessage('make strong password with minimum 6 characters');
        return;
    }

    try {
        const snapshot = await db.ref('users').orderByChild('username').equalTo(username).once('value');
        if (snapshot.exists()) {
            showErrorMessage('Username already taken. Please choose another.');
            return;
        }

        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const uid = userCredential.user.uid;

        const now = new Date();

        const registerDate = now.toLocaleDateString('en-CA', {
            timeZone: 'Asia/Colombo'
        });

        const registerTime = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Colombo'
        });

        const registerTimestamp = now.getTime();
        await db.ref('users/' + uid).set({
            username: username,
            email: email,
            photoURL: `https://api.dicebear.com/6.x/bottts-neutral/svg?seed=${uid}`,
            registerDate: registerDate,
            registerTime: registerTime,
            registerTimestamp: registerTimestamp
        });

        showSuccessMessage('Registration successful. Please Login now.');
        toggleFlip();
        document.getElementById('registerForm').reset();

    } catch (err) {
        console.error("Registration error:", err);
        if (err.code === 'auth/email-already-in-use') {
            showErrorMessage('Email is already taken choose another');
        } else if (err.code === 'auth/weak-password') {
            showErrorMessage('Password is too weak.make strong one');
        } else {
            showErrorMessage(`Registration error: ${err.message}`);
        }
    }
});

const googleProvider = new firebase.auth.GoogleAuthProvider();

document.getElementById('googleSignInBtn').addEventListener('click', () => {
    auth.signInWithPopup(googleProvider)
        .then(async (result) => {
            const user = result.user;

            if (user) {
                const idToken = await user.getIdToken();
                document.cookie = `firebaseToken=${idToken}; path=/; Secure; SameSite=Strict; max-age=3600`;

                console.log('Firebase ID Token:', idToken);

                const userRef = db.ref('users/' + user.uid);

                userRef.once('value').then(snapshot => {
                    const now = new Date();
                    const registerDate = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' });
                    const registerTime = now.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                        timeZone: 'Asia/Colombo'
                    });
                    const registerTimestamp = now.getTime();

                    if (!snapshot.exists()) {
                        userRef.set({
                            username: user.displayName || 'google_user',
                            email: user.email,
                            photoURL: user.photoURL || '',
                            registerDate,
                            registerTime,
                            registerTimestamp,
                            lastLoginTimestamp: registerTimestamp,
                            loginCount: 1
                        }).then(() => {
                            window.location.href = 'index.html';
                        });
                    } else {
                        const currentLoginCount = snapshot.val().loginCount || 0;
                        userRef.update({
                            lastLoginTimestamp: registerTimestamp,
                            loginCount: currentLoginCount + 1
                        }).then(() => {
                            window.location.href = 'index.html';
                        });
                    }
                });
            }
        })
        .catch((error) => {
            console.error('Google popup error:', error);
            showErrorMessage(`Google login failed: ${error.message}`);
        });
});

//forgot password modal start
function forgotPassword() {
    openForgotModal();
}

function openForgotModal() {
    document.getElementById('forgotPasswordModal').classList.remove('hidden');
    showStep('stepEmail');
}

function closeForgotModal() {
    document.getElementById('forgotPasswordModal').classList.add('hidden');
    resetForgotModal();
}

function showStep(stepId) {
    document.querySelectorAll('.step-section').forEach(el => el.classList.add('hidden'));
    document.getElementById(stepId).classList.remove('hidden');
}

function resetForgotModal() {
    document.getElementById('resetEmail').value = '';
    document.getElementById('otpInput').value = '';
    document.getElementById('newPassword').value = '';
    showStep('stepEmail');
}

function generateOTP(length = 6) {
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10);
    }
    return otp;
}

async function sendOTP(email) {
    const otp = generateOTP();
    const now = Date.now();
    const expiresAt = now + 5 * 60 * 1000;
    const emailKey = email.replace('.', '_');
    const attemptsRef = db.ref(`otpAttempts/${emailKey}`);

    const snapshot = await attemptsRef.once('value');
    const attempts = snapshot.val() || [];

    const recentAttempts = attempts.filter(ts => now - ts < 30 * 60 * 1000);

    if (recentAttempts.length >= 4) {
        showErrorMessage('Too many requests. Try again after 30 minutes.');
        return false;
    }

    recentAttempts.push(now);
    await attemptsRef.set(recentAttempts);

    await db.ref('passwordResetOtps/' + emailKey).set({ otp, expiresAt });

    const templateParams = {
        name: email,
        user_name: 'YourApp',
        otp: otp,
        to_email: email,
    };

    try {
        await emailjs.send('service_8ke883v', 'template_ou2hgcb', templateParams);
        showSuccessMessage("OTP sent to your email address.");
        return true;
    } catch (error) {
        console.error("EmailJS error:", error);
        showErrorMessage("Failed to send OTP email.");
        return false;
    }
}

async function handleSendOtp() {
    const email = document.getElementById('resetEmail').value.trim().toLowerCase();

    if (!email || !email.includes('@')) {
        showErrorMessage('Please enter a valid email address.');
        return;
    }

    const snapshot = await db.ref('users').orderByChild('email').equalTo(email).once('value');
    if (!snapshot.exists()) {
        showErrorMessage('No account found with this email.');
        return;
    }

    const otpSent = await sendOTP(email);

    if (otpSent) {
        showStep('stepOtp');
    } else {
        showStep('stepEmail');
    }
}

async function verifyOTP(email, enteredOtp) {
    const snapshot = await db.ref('passwordResetOtps/' + email.replace('.', '_')).once('value');
    if (!snapshot.exists()) {
        showErrorMessage('No OTP request found. Please send OTP first.');
        return false;
    }

    const data = snapshot.val();

    if (Date.now() > data.expiresAt) {
        showErrorMessage('OTP expired. Please resend OTP.');
        await db.ref('passwordResetOtps/' + email.replace('.', '_')).remove();
        return false;
    }

    if (data.otp !== enteredOtp) {
        showErrorMessage('Incorrect OTP. Try again.');
        return false;
    }

    await db.ref('passwordResetOtps/' + email.replace('.', '_')).remove();
    return true;
}

async function handleVerifyOtp() {
    const email = document.getElementById('resetEmail').value.trim().toLowerCase();
    const otp = document.getElementById('otpInput').value.trim();

    if (!otp) {
        showErrorMessage('Please enter OTP.');
        return;
    }

    const valid = await verifyOTP(email, otp);
    if (valid) {
        showSuccessMessage('OTP verified! Please enter your new password.');
        showStep('stepNewPassword');
    }
}

function resendOtp() {
    showStep('stepEmail');
    showSuccessMessage('Resend your OTP again.');
}

async function handleResetPassword() {
    const email = document.getElementById('resetEmail').value.trim().toLowerCase();
    const newPassword = document.getElementById('newPassword').value;

    if (!newPassword || newPassword.length < 6) {
        showErrorMessage('Password must be at least 6 characters.');
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: email,
                newPassword: newPassword
            })
        });

        if (response.ok) {
            showSuccessMessage('✅ Password reset successfully.');
            closeForgotModal();
        } else {
            const errorText = await response.text();
            showErrorMessage('❌ Failed: ' + errorText);
        }
    } catch (err) {
        showErrorMessage('❌ Error: ' + err.message);
    }
}