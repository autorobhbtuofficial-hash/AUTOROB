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

    // Sign up with email and password
    const signup = async (email, password, displayName) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Create user document in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            uid: userCredential.user.uid,
            email,
            displayName,
            role: 'user',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return userCredential;
    };

    // Sign in with email and password
    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
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
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        return userCredential;
    };

    // Sign out
    const logout = () => {
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
            console.error('Error getting user role:', error);
            return 'user';
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                const role = await getUserRole(user.uid);
                setUserRole(role);
            } else {
                setUserRole(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userRole,
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
