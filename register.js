

    document.getElementById('btnSendOtp').addEventListener('click', async () => {
        const email = document.getElementById("otpEmail").value.trim().toLowerCase();

        if (!email || !email.includes("@")) {
            showErrorMessage("⚠️ Please enter a valid email address.");
            return;
        }

        try {
            await firebase.auth().sendPasswordResetEmail(email);
            showSuccessMessage("📧 Password reset email sent! Please check your inbox.");
            closeOtpModal();
        } catch (error) {
            console.error("Reset email error:", error.code, error.message);
            if (error.code === 'auth/user-not-found') {
                showErrorMessage("❌ No account found with this email.");
            } else if (error.code === 'auth/invalid-email') {
                showErrorMessage("⚠️ Invalid email format.");
            } else {
                showErrorMessage(`⚠️ Error: ${error.message}`);
            }
        }
    });
    document.getElementById('btnVerifyOtp').addEventListener('click', verifyOtpAjax);
    document.getElementById('btnResetPwd').addEventListener('click', resetPwdAjax);

    function openOtpModal(){ document.getElementById('otpResetModal').classList.remove('hidden'); }
    function closeOtpModal(){
        document.getElementById('otpResetModal').classList.add('hidden');
        ['otpEmail','otpCode','newPassword'].forEach(id=>document.getElementById(id).value='');
        ['step-email','step-otp','step-password'].forEach(s=> document.getElementById(s).classList.toggle('hidden', s!=='step-email'));
    }

    function sendOtpAjax() {
        $.ajax({
            type: 'POST',
            url: '/api/send-otp',
            contentType: 'application/json',
            data: JSON.stringify({ email: $('#otpEmail').val().trim() }),
            success: resp => {
                if (resp.success) {
                    showSuccessMessage('OTP sent to your email.');
                    $('#step-email').hide();
                    $('#step-otp').show();
                } else {
                    showErrorMessage('Failed to send OTP.');
                }
            },
            error: () => showErrorMessage('Server error sending OTP.')
        });
    }

    function verifyOtpAjax() {
        $.ajax({
            type: 'POST',
            url: '/api/verify-otp',
            contentType: 'application/json',
            data: JSON.stringify({
                email: $('#otpEmail').val().trim(),
                otp: $('#otpCode').val().trim()
            }),
            success: resp => {
                if (resp.success) {
                    showSuccessMessage('OTP verified.');
                    $('#step-otp').hide();
                    $('#step-password').show();
                } else {
                    showErrorMessage('Invalid OTP.');
                }
            },
            error: () => showErrorMessage('Server error verifying OTP.')
        });
    }

    function resetPwdAjax() {
        const pwd = $('#newPassword').val();
        if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(pwd)) {
            showErrorMessage('Password must be >=6 chars with letters & numbers.');
            return;
        }
        $.ajax({
            type: 'POST',
            url: '/api/reset-password',
            contentType: 'application/json',
            data: JSON.stringify({
                email: $('#otpEmail').val().trim(),
                password: pwd
            }),
            success: resp => {
                if (resp.success) {
                    showSuccessMessage('Password reset successful!');
                    closeOtpModal();
                } else {
                    showErrorMessage('Reset failed.');
                }
            },
            error: () => showErrorMessage('Server error resetting password.')
        });
    }
