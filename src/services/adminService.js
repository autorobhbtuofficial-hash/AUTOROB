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

// ==================== EVENTS ====================

export const createEvent = async (eventData) => {
    try {
        const docRef = await addDoc(collection(db, 'events'), {
            ...eventData,
            currentRegistrations: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating event:', error);
        return { success: false, error: error.message };
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
        return { success: false, error: error.message };
    }
};

export const updateEvent = async (eventId, eventData) => {
    try {
        const eventRef = doc(db, 'events', eventId);
        await updateDoc(eventRef, {
            ...eventData,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating event:', error);
        return { success: false, error: error.message };
    }
};

export const deleteEvent = async (eventId) => {
    try {
        await deleteDoc(doc(db, 'events', eventId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting event:', error);
        return { success: false, error: error.message };
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
        return { success: false, error: error.message };
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
        return { success: false, error: error.message };
    }
};

export const updateTeamMember = async (memberId, memberData) => {
    try {
        const memberRef = doc(db, 'team_members', memberId);
        await updateDoc(memberRef, memberData);
        return { success: true };
    } catch (error) {
        console.error('Error updating team member:', error);
        return { success: false, error: error.message };
    }
};

export const deleteTeamMember = async (memberId) => {
    try {
        await deleteDoc(doc(db, 'team_members', memberId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting team member:', error);
        return { success: false, error: error.message };
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
        return { success: false, error: error.message };
    }
};

export const updateUserRole = async (userId, role) => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { role });
        return { success: true };
    } catch (error) {
        console.error('Error updating user role:', error);
        return { success: false, error: error.message };
    }
};

export const banUser = async (userId, isBanned) => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { isBanned });
        return { success: true };
    } catch (error) {
        console.error('Error banning user:', error);
        return { success: false, error: error.message };
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
        return { success: false, error: error.message };
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
        return { success: false, error: error.message };
    }
};

export const updateGalleryImage = async (imageId, imageData) => {
    try {
        const imageRef = doc(db, 'gallery_images', imageId);
        await updateDoc(imageRef, imageData);
        return { success: true };
    } catch (error) {
        console.error('Error updating gallery image:', error);
        return { success: false, error: error.message };
    }
};

export const deleteGalleryImage = async (imageId) => {
    try {
        await deleteDoc(doc(db, 'gallery_images', imageId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting gallery image:', error);
        return { success: false, error: error.message };
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
        return { success: false, error: error.message };
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
        return { success: false, error: error.message };
    }
};

export const updateNews = async (newsId, newsData) => {
    try {
        const newsRef = doc(db, 'news', newsId);
        await updateDoc(newsRef, newsData);
        return { success: true };
    } catch (error) {
        console.error('Error updating news:', error);
        return { success: false, error: error.message };
    }
};

export const deleteNews = async (newsId) => {
    try {
        await deleteDoc(doc(db, 'news', newsId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting news:', error);
        return { success: false, error: error.message };
    }
};

// ==================== REGISTRATIONS ====================

export const getEventRegistrations = async (eventId) => {
    try {
        const q = query(collection(db, 'registrations'), where('eventId', '==', eventId));
        const querySnapshot = await getDocs(q);
        const registrations = [];
        querySnapshot.forEach((doc) => {
            registrations.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: registrations };
    } catch (error) {
        console.error('Error getting registrations:', error);
        return { success: false, error: error.message };
    }
};

// ==================== ANALYTICS ====================

export const getAnalytics = async () => {
    try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const eventsSnapshot = await getDocs(collection(db, 'events'));
        const registrationsSnapshot = await getDocs(collection(db, 'registrations'));

        return {
            success: true,
            data: {
                totalUsers: usersSnapshot.size,
                totalEvents: eventsSnapshot.size,
                totalRegistrations: registrationsSnapshot.size
            }
        };
    } catch (error) {
        console.error('Error getting analytics:', error);
        return { success: false, error: error.message };
    }
};

// ==================== CLOUDINARY UPLOAD ====================

export const uploadToCloudinary = async (file) => {
    try {
        console.log('Starting Cloudinary upload...');
        console.log('Cloud Name:', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
        console.log('Upload Preset:', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

        if (!import.meta.env.VITE_CLOUDINARY_CLOUD_NAME) {
            throw new Error('Cloudinary cloud name is not configured');
        }

        if (!import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET) {
            throw new Error('Cloudinary upload preset is not configured. Please set VITE_CLOUDINARY_UPLOAD_PRESET in .env file');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

        console.log('Uploading file:', file.name, 'Size:', file.size);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData
            }
        );

        const data = await response.json();

        console.log('Cloudinary response:', data);

        if (!response.ok) {
            throw new Error(data.error?.message || 'Upload failed');
        }

        if (!data.secure_url) {
            throw new Error('No URL returned from Cloudinary');
        }

        console.log('Upload successful! URL:', data.secure_url);
        return { success: true, url: data.secure_url };
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        return { success: false, error: error.message };
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
