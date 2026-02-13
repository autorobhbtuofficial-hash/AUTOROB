import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import {
    getAllGalleryImages,
    createGalleryImage,
    updateGalleryImage,
    deleteGalleryImage,
    uploadToCloudinary
} from '../../../services/adminService';
import '../EventManagement/EventManagement.css';

const GalleryManagement = forwardRef(({ userRole }, ref) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingImage, setEditingImage] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Events'
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchImages();
    }, []);

    // Expose triggerCreate method to parent via ref
    useImperativeHandle(ref, () => ({
        triggerCreate: handleUpload
    }));

    const fetchImages = async () => {
        setLoading(true);
        const result = await getAllGalleryImages();
        if (result.success) {
            setImages(result.data);
        }
        setLoading(false);
    };

    const handleUpload = () => {
        setEditingImage(null);
        setFormData({ title: '', description: '', category: 'Events' });
        setImageFiles([]);
        setIsModalOpen(true);
    };

    const handleEdit = (image) => {
        setEditingImage(image);
        setFormData({
            title: image.title || '',
            description: image.description || '',
            category: image.category || 'Events'
        });
        setImageFiles([]);
        setIsModalOpen(true);
    };

    const handleDelete = async (image) => {
        if (userRole !== 'admin') {
            alert('Only admins can delete images');
            return;
        }

        if (!confirm('Are you sure you want to delete this image?')) {
            return;
        }

        const result = await deleteGalleryImage(image.id);
        if (result.success) {
            alert('Image deleted successfully!');
            fetchImages();
        } else {
            alert('Error: ' + result.error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setUploading(true);

        if (editingImage) {
            // Update existing image metadata
            const result = await updateGalleryImage(editingImage.id, {
                title: formData.title,
                description: formData.description,
                category: formData.category
            });

            if (result.success) {
                alert('Image updated successfully!');
                setIsModalOpen(false);
                fetchImages();
            } else {
                alert('Error: ' + result.error);
            }
        } else {
            // Create new images
            if (imageFiles.length === 0) {
                alert('Please select at least one image');
                setUploading(false);
                return;
            }

            for (const file of imageFiles) {
                const uploadResult = await uploadToCloudinary(file);
                if (uploadResult.success) {
                    await createGalleryImage({
                        imageUrl: uploadResult.url,
                        thumbnailUrl: uploadResult.url,
                        title: formData.title || file.name,
                        description: formData.description,
                        category: formData.category
                    });
                }
            }

            alert(`${imageFiles.length} image(s) uploaded successfully!`);
            setIsModalOpen(false);
            fetchImages();
        }

        setUploading(false);
    };

    const columns = [
        {
            key: 'imageUrl',
            label: 'Image',
            render: (value) => (
                <img src={value} alt="Gallery" style={{ width: '80px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
            )
        },
        { key: 'title', label: 'Title', sortable: true },
        { key: 'category', label: 'Category', sortable: true },
        {
            key: 'uploadedAt',
            label: 'Uploaded',
            sortable: true,
            render: (value) => value ? new Date(value.seconds * 1000).toLocaleDateString() : 'N/A'
        }
    ];

    if (loading) {
        return (
            <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading gallery...</p>
            </div>
        );
    }

    return (
        <div className="event-management">
            <div className="section-header">
                <div>
                    <h1 className="gradient-text">Gallery Management</h1>
                    <p className="section-subtitle">Manage gallery images and categories</p>
                </div>
                <button className="btn btn-primary interactive" onClick={handleUpload}>
                    <i className="fas fa-upload"></i>
                    Upload Images
                </button>
            </div>

            <DataTable
                columns={columns}
                data={images}
                onEdit={handleEdit}
                onDelete={userRole === 'admin' ? handleDelete : null}
                actions={userRole === 'admin' ? ['edit', 'delete'] : ['edit']}
            />

            {/* Upload Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingImage ? "Edit Image" : "Upload Images"}
                size="medium"
            >
                <form onSubmit={handleSubmit} className="event-form">
                    {!editingImage && (
                        <div className="form-group">
                            <label>Images * (Multiple)</label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => setImageFiles(Array.from(e.target.files))}
                                required
                            />
                            {imageFiles.length > 0 && (
                                <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                                    {imageFiles.length} file(s) selected
                                </p>
                            )}
                        </div>
                    )}

                    {editingImage && (
                        <div className="form-group">
                            <label>Current Image</label>
                            <img src={editingImage.imageUrl} alt={editingImage.title} style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }} />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Title {editingImage ? '*' : '(Optional)'}</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder={editingImage ? "Enter image title" : "Leave empty to use filename"}
                            required={editingImage}
                        />
                    </div>

                    <div className="form-group">
                        <label>Category *</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                        >
                            <option value="Events">Events</option>
                            <option value="Workshops">Workshops</option>
                            <option value="Competitions">Competitions</option>
                            <option value="Team">Team</option>
                            <option value="Projects">Projects</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="3"
                        ></textarea>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-glass interactive" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary interactive" disabled={uploading}>
                            {uploading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    {editingImage ? 'Updating...' : 'Uploading...'}
                                </>
                            ) : (
                                <>
                                    <i className={`fas fa-${editingImage ? 'save' : 'upload'}`}></i>
                                    {editingImage ? 'Update Image' : 'Upload Images'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
});

export default GalleryManagement;
