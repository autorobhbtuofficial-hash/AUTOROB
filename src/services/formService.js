import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Send form data to webhook URL (for Google Sheets, Zapier, etc.)
 * NOTE: Only call after isSafeWebhookUrl() check in DynamicForm.
 */
const sendToWebhook = async (webhookUrl, data) => {
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`Webhook responded with status ${response.status}`);
        }
        return { success: true };
    } catch (error) {
        console.error('Webhook error:', error);
        // Don't surface internal error to caller — webhook failure is non-critical
        return { success: false, error: 'Webhook delivery failed.' };
    }
};

// ==================== FORM SUBMISSIONS ====================

/**
 * Submit event registration form.
 * @param {string} eventId
 * @param {string} eventTitle
 * @param {object} formResponses
 * @param {string|null} userId
 * @param {string|null} webhookUrl
 */
export const submitEventRegistration = async (eventId, eventTitle, formResponses, userId = null, webhookUrl = null) => {
    try {
        const docRef = await addDoc(collection(db, 'form_responses', eventId, 'registrations'), {
            userId,
            responses: formResponses,
            status: 'pending',
            submittedAt: serverTimestamp()
        });

        let webhookSent = false;
        if (webhookUrl) {
            const webhookData = {
                eventId,
                eventTitle,
                submittedAt: new Date().toISOString(),
                responses: formResponses,
                responseId: docRef.id
            };
            const webhookResult = await sendToWebhook(webhookUrl, webhookData);
            webhookSent = webhookResult.success;
            if (!webhookResult.success) {
                console.warn('Webhook failed but form was saved to Firebase.');
            }
        }

        return { success: true, id: docRef.id, webhookSent };
    } catch (error) {
        console.error('Error submitting form:', error);
        return { success: false, error: 'Failed to submit registration. Please try again.' };
    }
};

/**
 * Get all form responses for a specific event.
 */
export const getEventFormResponses = async (eventId, eventTitle = '') => {
    try {
        const q = query(
            collection(db, 'form_responses', eventId, 'registrations'),
            orderBy('submittedAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const responses = [];
        querySnapshot.forEach((doc) => {
            responses.push({ id: doc.id, eventId, eventTitle, ...doc.data() });
        });
        return { success: true, data: responses };
    } catch (error) {
        console.error('Error getting form responses:', error);
        return { success: false, error: 'Failed to load form responses.' };
    }
};

/**
 * Get all form responses across all events.
 */
export const getAllFormResponses = async (events = []) => {
    try {
        const allResponses = [];
        for (const event of events) {
            const result = await getEventFormResponses(event.id, event.title);
            if (result.success && result.data) {
                allResponses.push(...result.data);
            }
        }
        allResponses.sort((a, b) => {
            const timeA = a.submittedAt?.seconds || 0;
            const timeB = b.submittedAt?.seconds || 0;
            return timeB - timeA;
        });
        return { success: true, data: allResponses };
    } catch (error) {
        console.error('Error getting all form responses:', error);
        return { success: false, error: 'Failed to load form responses.' };
    }
};

/**
 * Update form response (admin only).
 */
export const updateFormResponse = async (eventId, responseId, data) => {
    try {
        const responseRef = doc(db, 'form_responses', eventId, 'registrations', responseId);
        await updateDoc(responseRef, data);
        return { success: true };
    } catch (error) {
        console.error('Error updating form response:', error);
        return { success: false, error: 'Failed to update response.' };
    }
};

/**
 * Delete form response (admin only).
 */
export const deleteFormResponse = async (eventId, responseId) => {
    try {
        await deleteDoc(doc(db, 'form_responses', eventId, 'registrations', responseId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting form response:', error);
        return { success: false, error: 'Failed to delete response.' };
    }
};

/**
 * Upload file for form field via Cloudinary.
 */
export const uploadFormFile = async (file, eventId, fieldName) => {
    try {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            return { success: false, error: 'File upload is not configured. Please contact an administrator.' };
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', `event-forms/${eventId}/${fieldName}`);

        const resourceType = file.type.startsWith('image/') ? 'image' : 'auto';
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
            { method: 'POST', body: formData, mode: 'cors', credentials: 'omit' }
        );

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error?.message || `Server returned ${response.status}`);
        }

        const data = await response.json();
        return { success: true, url: data.secure_url };
    } catch (error) {
        console.error('Error uploading form file:', error);
        // Special case: network failure (e.g. mobile data / AdBlocker)
        if (error.message === 'Failed to fetch') {
            return {
                success: false,
                error: 'Network connection failed. Please try on WiFi or disable any AdBlocker/VPN and try again.'
            };
        }
        return { success: false, error: 'File upload failed. Please try again.' };
    }
};

/**
 * Get all event registrations for a specific user.
 */
export const getUserEventRegistrations = async (userId) => {
    try {
        if (!userId) {
            return { success: false, error: 'User ID is required.' };
        }

        const allRegistrations = [];
        const eventsSnapshot = await getDocs(collection(db, 'events'));

        for (const eventDoc of eventsSnapshot.docs) {
            const eventId = eventDoc.id;
            const eventData = eventDoc.data();
            const q = query(
                collection(db, 'form_responses', eventId, 'registrations'),
                where('userId', '==', userId)
            );
            const registrationsSnapshot = await getDocs(q);
            registrationsSnapshot.forEach((doc) => {
                allRegistrations.push({
                    id: doc.id,
                    eventId,
                    eventTitle: eventData.title,
                    eventDate: eventData.date,
                    eventTime: eventData.time,
                    eventVenue: eventData.venue,
                    eventCategory: eventData.category,
                    ...doc.data()
                });
            });
        }

        allRegistrations.sort((a, b) => {
            const timeA = a.submittedAt?.seconds || 0;
            const timeB = b.submittedAt?.seconds || 0;
            return timeB - timeA;
        });

        return { success: true, data: allRegistrations };
    } catch (error) {
        console.error('Error getting user registrations:', error);
        return { success: false, error: 'Failed to load your registrations.' };
    }
};

/**
 * Get a specific user's response for an event.
 */
export const getUserEventResponse = async (eventId, userId) => {
    try {
        if (!eventId || !userId) {
            return { success: false, error: 'Event ID and User ID are required.' };
        }

        const q = query(
            collection(db, 'form_responses', eventId, 'registrations'),
            where('userId', '==', userId)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { success: true, data: null };
        }

        const docSnap = querySnapshot.docs[0];
        return {
            success: true,
            data: { id: docSnap.id, eventId, ...docSnap.data() }
        };
    } catch (error) {
        console.error('Error getting user event response:', error);
        return { success: false, error: 'Failed to load your response.' };
    }
};
