/**
 * Maps Firebase Auth error codes to user-friendly, professional messages.
 * @param {Object} error - The error object from Firebase
 * @returns {string} - A human-readable error message
 */
export const getAuthErrorMessage = (error) => {
    if (!error) return 'Authentication failed. Please try again.';

    // Support both older 'code' format and newer 'auth/...' format
    const errorCode = error.code || '';

    switch (errorCode) {
        // Sign-In Errors
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/user-disabled':
            return 'This account has been disabled. Please contact support.';
        case 'auth/user-not-found':
            return 'No account found with this email. Please sign up instead.';
        case 'auth/wrong-password':
            return 'Invalid password. Please try again.';
        case 'auth/invalid-credential':
            // Modern Firebase uses this for both wrong password and user not found for security
            return 'Invalid email or password. Please check your credentials.';

        // Sign-Up Errors
        case 'auth/email-already-in-use':
            return 'An account already exists with this email.';
        case 'auth/weak-password':
            return 'Password is too weak. It should be at least 6 characters.';

        // General Errors
        case 'auth/network-request-failed':
            return 'Network error. Please check your internet connection.';
        case 'auth/too-many-requests':
            return 'Too many failed login attempts. Please try again later.';
        case 'auth/operation-not-allowed':
            return 'This sign-in method is currently disabled.';
        case 'auth/popup-closed-by-user':
            return 'Sign-in window was closed. Please try again.';
        case 'auth/cancelled-popup-request':
            return 'A new sign-in request was started. Please complete the sign-in in the popup window.';
        case 'auth/popup-blocked':
            return 'Sign-in popup was blocked by your browser. Please allow popups for this site and try again.';
        case 'auth/account-exists-with-different-credential':
            return 'An account already exists with the same email but a different sign-in method. Try signing in with email/password.';
        case 'auth/internal-error':
            return 'An internal server error occurred. Please try again.';

        default:
            // Log the original error for debugging if needed, but show a clean message
            console.error('Firebase Auth Error:', errorCode, error.message);
            return 'Authentication failed. Please check your details and try again.';
    }
};
