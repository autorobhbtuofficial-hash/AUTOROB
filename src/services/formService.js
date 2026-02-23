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
 * @param {string} webhookUrl - Webhook URL
 * @param {object} data - Data to send
 * @returns {Promise<{success: boolean, error?: string}>}
 */
const sendToWebhook = async (webhookUrl, data) => {
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
        }

        return { success: true };
    } catch (error) {
        console.error('Webhook error:', error);
        return { success: false, error: error.message };
    }
};

// ==================== FORM SUBMISSIONS ====================

/**
 * Submit event registration form
 * @param {string} eventId - Event ID
 * @param {string} eventTitle - Event title (denormalized)
 * @param {object} formResponses - Form field responses { fieldId: { label, value, type } }
 * @param {string|null} userId - User ID if logged in
 * @param {string|null} webhookUrl - Optional webhook URL for integration
 * @returns {Promise<{success: boolean, id?: string, error?: string, webhookSent?: boolean}>}
 */
export const submitEventRegistration = async (eventId, eventTitle, formResponses, userId = null, webhookUrl = null) => {
    try {
        // Store responses nested under event: form_responses/{eventId}/registrations/{responseId}
        const docRef = await addDoc(collection(db, 'form_responses', eventId, 'registrations'), {
            userId,
            responses: formResponses,
            status: 'pending',
            submittedAt: serverTimestamp()
        });

        // Send to webhook if configured
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
                console.warn('Webhook failed but form was saved to Firebase:', webhookResult.error);
            }
        }

        return { success: true, id: docRef.id, webhookSent };
    } catch (error) {
        console.error('Error submitting form:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get all form responses for a specific event
 * @param {string} eventId - Event ID
 * @param {string} eventTitle - Event title (for denormalization)
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
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
            responses.push({
                id: doc.id,
                eventId,
                eventTitle,
                ...doc.data()
            });
        });
        return { success: true, data: responses };
    } catch (error) {
        console.error('Error getting form responses:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get all form responses across all events
 * @param {array} events - Array of event objects with id and title
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export const getAllFormResponses = async (events = []) => {
    try {
        const allResponses = [];

        // Fetch responses from each event's subcollection
        for (const event of events) {
            const result = await getEventFormResponses(event.id, event.title);
            if (result.success && result.data) {
                allResponses.push(...result.data);
            }
        }

        // Sort by submittedAt descending
        allResponses.sort((a, b) => {
            const timeA = a.submittedAt?.seconds || 0;
            const timeB = b.submittedAt?.seconds || 0;
            return timeB - timeA;
        });

        return { success: true, data: allResponses };
    } catch (error) {
        console.error('Error getting all form responses:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Update form response (admin only)
 * @param {string} eventId - Event ID
 * @param {string} responseId - Response ID
 * @param {object} data - Data to update
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const updateFormResponse = async (eventId, responseId, data) => {
    try {
        const responseRef = doc(db, 'form_responses', eventId, 'registrations', responseId);
        await updateDoc(responseRef, data);
        return { success: true };
    } catch (error) {
        console.error('Error updating form response:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Delete form response (admin only)
 * @param {string} eventId - Event ID
 * @param {string} responseId - Response ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteFormResponse = async (eventId, responseId) => {
    try {
        await deleteDoc(doc(db, 'form_responses', eventId, 'registrations', responseId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting form response:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Upload file for form field
 * @param {File} file - File to upload
 * @param {string} eventId - Event ID for folder organization
 * @param {string} fieldName - Field name for folder organization
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export const uploadFormFile = async (file, eventId, fieldName) => {
    try {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            throw new Error('Cloudinary configuration missing. Please check connection and environment variables.');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', `event-forms/${eventId}/${fieldName}`);

        // For images, we use 'image' resource type. For others, 'auto' is fine.
        // This helps some mobile browsers and Cloudinary's processing.
        const resourceType = file.type.startsWith('image/') ? 'image' : 'auto';

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
            {
                method: 'POST',
                body: formData,
                mode: 'cors',
                // Important for some mobile browsers to not send session cookies or local credentials
                credentials: 'omit'
            }
        );

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error?.message || `Server returned ${response.status}`);
        }

        const data = await response.json();
        return { success: true, url: data.secure_url };
    } catch (error) {
        console.error('Error uploading form file:', error);

        // Provide user-friendly advice for common mobile network errors
        if (error.message === 'Failed to fetch') {
            return {
                success: false,
                error: 'Network connection failed. This often happens on mobile data if the connection is unstable, or if you have an AdBlocker/VPN enabled that blocks the upload server. Please try on WiFi or disable AdBlockers.'
            };
        }

        return { success: false, error: error.message };
    }
};


/**
 * Get all event registrations for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export const getUserEventRegistrations = async (userId) => {
    try {
        if (!userId) {
            return { success: false, error: 'User ID is required' };
        }

        const allRegistrations = [];

        // Get all events first
        const eventsSnapshot = await getDocs(collection(db, 'events'));

        // For each event, check if user has a registration
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

        // Sort by submission date descending
        allRegistrations.sort((a, b) => {
            const timeA = a.submittedAt?.seconds || 0;
            const timeB = b.submittedAt?.seconds || 0;
            return timeB - timeA;
        });

        return { success: true, data: allRegistrations };
    } catch (error) {
        console.error('Error getting user registrations:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get a specific user's response for an event
 * @param {string} eventId - Event ID
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getUserEventResponse = async (eventId, userId) => {
    try {
        if (!eventId || !userId) {
            return { success: false, error: 'Event ID and User ID are required' };
        }

        const q = query(
            collection(db, 'form_responses', eventId, 'registrations'),
            where('userId', '==', userId)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { success: true, data: null };
        }

        const doc = querySnapshot.docs[0];
        return {
            success: true,
            data: {
                id: doc.id,
                eventId,
                ...doc.data()
            }
        };
    } catch (error) {
        console.error('Error getting user event response:', error);
        return { success: false, error: error.message };
    }
};
