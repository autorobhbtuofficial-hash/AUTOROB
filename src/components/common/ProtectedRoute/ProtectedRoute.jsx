import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * ProtectedRoute — wraps any route that requires authentication.
 * If user is not logged in, redirects to /login with the current path
 * saved so we can redirect back after login.
 *
 * For elevated routes, pass a `roleCheck` function (e.g. isElevated, isAdmin)
 * instead of a plain string array — this keeps role strings OUT of JSX.
 */
const ProtectedRoute = ({ children, roleCheck = null }) => {
    const { currentUser, userRole, loading } = useAuth();
    const location = useLocation();

    // Still initialising Firebase auth — render nothing (AuthProvider already handles loading)
    if (loading) return null;

    // Not logged in → go to login, remember where they came from
    if (!currentUser) {
        return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
    }

    // Role-restricted route — roleCheck is a function like isElevated(role)
    if (roleCheck && !roleCheck(userRole)) {
        // Logged in but wrong role → kick to dashboard silently
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
