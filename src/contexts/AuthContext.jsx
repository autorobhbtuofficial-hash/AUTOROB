import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bannedError, setBannedError] = useState(null);

    // Get full user document from Firestore
    const getUserDoc = async (uid) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                return userDoc.data();
            }
            return null;
        } catch (error) {
            return null;
        }
    };

    // Sign up with email and password
    const signup = async (email, password, displayName) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Create user document in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            uid: userCredential.user.uid,
            email,
            displayName,
            role: 'user',       // NEVER assign elevated roles here — set manually via admin panel only
            isBanned: false,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return userCredential;
    };

    // Sign in with email and password
    const login = async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // Immediately check if banned after login
        const userData = await getUserDoc(userCredential.user.uid);
        if (userData?.isBanned) {
            await signOut(auth);
            throw new Error('Your account has been suspended. Please contact support.');
        }

        return userCredential;
    };

    // Sign in with Google
    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);

        // Check if user document exists, if not create one
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                displayName: userCredential.user.displayName,
                photoURL: userCredential.user.photoURL,
                role: 'user',
                isBanned: false,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        } else {
            // Existing Google user — check banned status
            const userData = userDoc.data();
            if (userData?.isBanned) {
                await signOut(auth);
                throw new Error('Your account has been suspended. Please contact support.');
            }
        }

        return userCredential;
    };

    // Sign out
    const logout = () => {
        setBannedError(null);
        return signOut(auth);
    };

    // Get user role from Firestore
    const getUserRole = async (uid) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                return userDoc.data().role;
            }
            return 'user';
        } catch (error) {
            return 'user';
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userData = await getUserDoc(user.uid);

                // Block banned users — sign them out immediately
                if (userData?.isBanned) {
                    await signOut(auth);
                    setBannedError('Your account has been suspended. Please contact support.');
                    setCurrentUser(null);
                    setUserRole(null);
                    setLoading(false);
                    return;
                }

                setCurrentUser(user);
                setUserRole(userData?.role || 'user');
                setBannedError(null);
            } else {
                setCurrentUser(null);
                setUserRole(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userRole,
        bannedError,
        signup,
        login,
        loginWithGoogle,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
