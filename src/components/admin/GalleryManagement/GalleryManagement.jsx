import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import {
    getAllGalleryImages,
    createGalleryImage,
    deleteGalleryImage,
    uploadToCloudinary
} from '../../../services/adminService';
import '../EventManagement/EventManagement.css';

const GalleryManagement = forwardRef(({ userRole }, ref) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
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
        setFormData({ title: '', description: '', category: 'Events' });
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

        if (imageFiles.length === 0) {
            alert('Please select at least one image');
            return;
        }

        setUploading(true);

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

        setUploading(false);
        alert(`${imageFiles.length} image(s) uploaded successfully!`);
        setIsModalOpen(false);
        fetchImages();
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
                onDelete={userRole === 'admin' ? handleDelete : null}
                actions={userRole === 'admin' ? ['delete'] : []}
            />

            {/* Upload Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Upload Images"
                size="medium"
            >
                <form onSubmit={handleSubmit} className="event-form">
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

                    <div className="form-group">
                        <label>Title (Optional)</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Leave empty to use filename"
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
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-upload"></i>
                                    Upload Images
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
