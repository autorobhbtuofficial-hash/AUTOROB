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
        const docRef = await addDoc(collection(db, 'form_responses'), {
            eventId,
            eventTitle,
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
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export const getEventFormResponses = async (eventId) => {
    try {
        const q = query(
            collection(db, 'form_responses'),
            where('eventId', '==', eventId),
            orderBy('submittedAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const responses = [];
        querySnapshot.forEach((doc) => {
            responses.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: responses };
    } catch (error) {
        console.error('Error getting form responses:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get all form responses across all events
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export const getAllFormResponses = async () => {
    try {
        const q = query(collection(db, 'form_responses'), orderBy('submittedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const responses = [];
        querySnapshot.forEach((doc) => {
            responses.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: responses };
    } catch (error) {
        console.error('Error getting all form responses:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Update form response (admin only)
 * @param {string} responseId - Response ID
 * @param {object} data - Data to update
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const updateFormResponse = async (responseId, data) => {
    try {
        const responseRef = doc(db, 'form_responses', responseId);
        await updateDoc(responseRef, data);
        return { success: true };
    } catch (error) {
        console.error('Error updating form response:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Delete form response (admin only)
 * @param {string} responseId - Response ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteFormResponse = async (responseId) => {
    try {
        await deleteDoc(doc(db, 'form_responses', responseId));
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
        if (!import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || !import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET) {
            throw new Error('Cloudinary configuration missing');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', `event-forms/${eventId}/${fieldName}`);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`,
            {
                method: 'POST',
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Upload failed');
        }

        return { success: true, url: data.secure_url };
    } catch (error) {
        console.error('Error uploading form file:', error);
        return { success: false, error: error.message };
    }
};
