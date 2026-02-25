import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    getDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { adminRole, subAdminRole, userRole as baseUserRole } from '../utils/roles';

/**
 * Recursively remove undefined values from an object so Firestore doesn't reject them.
 */
const removeUndefined = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(removeUndefined);
    }
    if (obj !== null && typeof obj === 'object') {
        return Object.fromEntries(
            Object.entries(obj)
                .filter(([, v]) => v !== undefined)
                .map(([k, v]) => [k, removeUndefined(v)])
        );
    }
    return obj;
};

// ==================== EVENTS ====================

export const createEvent = async (eventData) => {
    try {
        const docRef = await addDoc(collection(db, 'events'), {
            ...removeUndefined(eventData),
            currentRegistrations: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating event:', error);
        return { success: false, error: 'Failed to create event. Please try again.' };
    }
};

export const getAllEvents = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'events'));
        const events = [];
        querySnapshot.forEach((doc) => {
            events.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: events };
    } catch (error) {
        console.error('Error getting events:', error);
        return { success: false, error: 'Failed to load events.' };
    }
};

export const updateEvent = async (eventId, eventData) => {
    try {
        const eventRef = doc(db, 'events', eventId);
        await updateDoc(eventRef, {
            ...removeUndefined(eventData),
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating event:', error);
        return { success: false, error: 'Failed to update event.' };
    }
};

export const deleteEvent = async (eventId) => {
    try {
        await deleteDoc(doc(db, 'events', eventId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting event:', error);
        return { success: false, error: 'Failed to delete event.' };
    }
};

// ==================== TEAM MEMBERS ====================

export const createTeamMember = async (memberData) => {
    try {
        const docRef = await addDoc(collection(db, 'team_members'), {
            ...memberData,
            createdAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating team member:', error);
        return { success: false, error: 'Failed to create team member.' };
    }
};

export const getAllTeamMembers = async () => {
    try {
        const q = query(collection(db, 'team_members'), orderBy('order', 'asc'));
        const querySnapshot = await getDocs(q);
        const members = [];
        querySnapshot.forEach((doc) => {
            members.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: members };
    } catch (error) {
        console.error('Error getting team members:', error);
        return { success: false, error: 'Failed to load team members.' };
    }
};

export const updateTeamMember = async (memberId, memberData) => {
    try {
        const memberRef = doc(db, 'team_members', memberId);
        await updateDoc(memberRef, memberData);
        return { success: true };
    } catch (error) {
        console.error('Error updating team member:', error);
        return { success: false, error: 'Failed to update team member.' };
    }
};

export const deleteTeamMember = async (memberId) => {
    try {
        await deleteDoc(doc(db, 'team_members', memberId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting team member:', error);
        return { success: false, error: 'Failed to delete team member.' };
    }
};

// ==================== USERS ====================

export const getAllUsers = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const users = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: users };
    } catch (error) {
        console.error('Error getting users:', error);
        return { success: false, error: 'Failed to load users.' };
    }
};

export const updateUserRole = async (userId, role) => {
    // Whitelist valid roles — reject anything else to prevent privilege escalation
    const VALID_ROLES = [baseUserRole(), subAdminRole(), adminRole()];
    if (!VALID_ROLES.includes(role)) {
        console.error('updateUserRole: invalid role attempted');
        return { success: false, error: 'Invalid role specified.' };
    }
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { role });
        return { success: true };
    } catch (error) {
        console.error('Error updating user role:', error);
        return { success: false, error: 'Failed to update user role.' };
    }
};

export const banUser = async (userId, isBanned) => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { isBanned });
        return { success: true };
    } catch (error) {
        console.error('Error banning user:', error);
        return { success: false, error: 'Failed to update user status.' };
    }
};

// ==================== GALLERY ====================

export const createGalleryImage = async (imageData) => {
    try {
        const docRef = await addDoc(collection(db, 'gallery_images'), {
            ...imageData,
            uploadedAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating gallery image:', error);
        return { success: false, error: 'Failed to upload image.' };
    }
};

export const getAllGalleryImages = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'gallery_images'));
        const images = [];
        querySnapshot.forEach((doc) => {
            images.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: images };
    } catch (error) {
        console.error('Error getting gallery images:', error);
        return { success: false, error: 'Failed to load gallery.' };
    }
};

export const updateGalleryImage = async (imageId, imageData) => {
    try {
        const imageRef = doc(db, 'gallery_images', imageId);
        await updateDoc(imageRef, imageData);
        return { success: true };
    } catch (error) {
        console.error('Error updating gallery image:', error);
        return { success: false, error: 'Failed to update image.' };
    }
};

export const deleteGalleryImage = async (imageId) => {
    try {
        await deleteDoc(doc(db, 'gallery_images', imageId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting gallery image:', error);
        return { success: false, error: 'Failed to delete image.' };
    }
};

// ==================== NEWS ====================

export const createNews = async (newsData) => {
    try {
        const docRef = await addDoc(collection(db, 'news'), {
            ...newsData,
            createdAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating news:', error);
        return { success: false, error: 'Failed to create news post.' };
    }
};

export const getAllNews = async () => {
    try {
        const q = query(collection(db, 'news'), orderBy('publishDate', 'desc'));
        const querySnapshot = await getDocs(q);
        const news = [];
        querySnapshot.forEach((doc) => {
            news.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: news };
    } catch (error) {
        console.error('Error getting news:', error);
        return { success: false, error: 'Failed to load news.' };
    }
};

export const updateNews = async (newsId, newsData) => {
    try {
        const newsRef = doc(db, 'news', newsId);
        await updateDoc(newsRef, newsData);
        return { success: true };
    } catch (error) {
        console.error('Error updating news:', error);
        return { success: false, error: 'Failed to update news post.' };
    }
};

export const deleteNews = async (newsId) => {
    try {
        await deleteDoc(doc(db, 'news', newsId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting news:', error);
        return { success: false, error: 'Failed to delete news post.' };
    }
};

// ==================== REGISTRATIONS ====================

export const getEventRegistrations = async (eventId) => {
    try {
        // Registrations are stored in form_responses subcollection (not flat /registrations)
        const regSnapshot = await getDocs(
            collection(db, 'form_responses', eventId, 'registrations')
        );
        const registrations = [];
        regSnapshot.forEach((doc) => {
            registrations.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: registrations };
    } catch (error) {
        console.error('Error getting registrations:', error);
        return { success: false, error: 'Failed to load registrations.' };
    }
};

// ==================== ANALYTICS ====================

export const getAnalytics = async () => {
    try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const eventsSnapshot = await getDocs(collection(db, 'events'));

        // Count total form response registrations across all events
        let totalRegistrations = 0;
        for (const eventDoc of eventsSnapshot.docs) {
            const regSnapshot = await getDocs(
                collection(db, 'form_responses', eventDoc.id, 'registrations')
            );
            totalRegistrations += regSnapshot.size;
        }

        return {
            success: true,
            data: {
                totalUsers: usersSnapshot.size,
                totalEvents: eventsSnapshot.size,
                totalRegistrations
            }
        };
    } catch (error) {
        console.error('Error getting analytics:', error);
        return { success: false, error: 'Failed to load analytics.' };
    }
};

// ==================== CLOUDINARY UPLOAD ====================

export const uploadToCloudinary = async (file) => {
    try {
        if (!import.meta.env.VITE_CLOUDINARY_CLOUD_NAME) {
            throw new Error('Cloudinary cloud name is not configured');
        }

        if (!import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET) {
            throw new Error('Cloudinary upload preset is not configured. Please set VITE_CLOUDINARY_UPLOAD_PRESET in .env file');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Upload failed');
        }

        if (!data.secure_url) {
            throw new Error('No URL returned from Cloudinary');
        }

        return { success: true, url: data.secure_url };
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        return { success: false, error: 'Failed to upload image. Please try again.' };
    }
};

// ==================== CSV EXPORT ====================

export const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
