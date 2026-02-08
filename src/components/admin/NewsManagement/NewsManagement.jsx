import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import {
    getAllNews,
    createNews,
    updateNews,
    deleteNews,
    uploadToCloudinary
} from '../../../services/adminService';
import '../EventManagement/EventManagement.css';

const NewsManagement = forwardRef(({ userRole }, ref) => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNews, setEditingNews] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        excerpt: '',
        author: '',
        publishDate: new Date().toISOString().split('T')[0],
        isPublished: true,
        isFeatured: false,
        tags: []
    });
    const [imageFile, setImageFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchNews();
    }, []);

    // Expose triggerCreate method to parent via ref
    useImperativeHandle(ref, () => ({
        triggerCreate: handleCreate
    }));

    const fetchNews = async () => {
        setLoading(true);
        const result = await getAllNews();
        if (result.success) {
            setNews(result.data);
        }
        setLoading(false);
    };

    const handleCreate = () => {
        setEditingNews(null);
        setFormData({
            title: '',
            content: '',
            excerpt: '',
            author: '',
            publishDate: new Date().toISOString().split('T')[0],
            isPublished: true,
            isFeatured: false,
            tags: []
        });
        setImageFile(null);
        setIsModalOpen(true);
    };

    const handleEdit = (newsItem) => {
        setEditingNews(newsItem);
        setFormData({
            title: newsItem.title || '',
            content: newsItem.content || '',
            excerpt: newsItem.excerpt || '',
            author: newsItem.author || '',
            publishDate: newsItem.publishDate || new Date().toISOString().split('T')[0],
            isPublished: newsItem.isPublished !== undefined ? newsItem.isPublished : true,
            isFeatured: newsItem.isFeatured || false,
            tags: newsItem.tags || []
        });
        setImageFile(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (newsItem) => {
        if (userRole !== 'admin') {
            alert('Only admins can delete news');
            return;
        }

        if (!confirm(`Are you sure you want to delete "${newsItem.title}"?`)) {
            return;
        }

        const result = await deleteNews(newsItem.id);
        if (result.success) {
            alert('News deleted successfully!');
            fetchNews();
        } else {
            alert('Error: ' + result.error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        let imageUrl = editingNews?.imageUrl || '';

        if (imageFile) {
            const uploadResult = await uploadToCloudinary(imageFile);
            if (uploadResult.success) {
                imageUrl = uploadResult.url;
            } else {
                alert('Error uploading image: ' + uploadResult.error);
                setUploading(false);
                return;
            }
        }

        const newsData = {
            ...formData,
            imageUrl
        };

        let result;
        if (editingNews) {
            result = await updateNews(editingNews.id, newsData);
        } else {
            result = await createNews(newsData);
        }

        setUploading(false);

        if (result.success) {
            alert(`News ${editingNews ? 'updated' : 'created'} successfully!`);
            setIsModalOpen(false);
            fetchNews();
        } else {
            alert('Error: ' + result.error);
        }
    };

    const columns = [
        { key: 'title', label: 'Title', sortable: true },
        { key: 'author', label: 'Author', sortable: true },
        {
            key: 'publishDate',
            label: 'Publish Date',
            sortable: true,
            render: (value) => new Date(value).toLocaleDateString()
        },
        {
            key: 'isPublished',
            label: 'Status',
            sortable: true,
            render: (value) => (
                <span className={`status-badge ${value ? 'open' : 'closed'}`}>
                    {value ? 'Published' : 'Draft'}
                </span>
            )
        },
        {
            key: 'isFeatured',
            label: 'Featured',
            sortable: true,
            render: (value) => value ? <i className="fas fa-star" style={{ color: '#f59e0b' }}></i> : '-'
        }
    ];

    if (loading) {
        return (
            <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading news...</p>
            </div>
        );
    }

    return (
        <div className="event-management">
            <div className="section-header">
                <div>
                    <h1 className="gradient-text">News Management</h1>
                    <p className="section-subtitle">Manage news articles and announcements</p>
                </div>
                <button className="btn btn-primary interactive" onClick={handleCreate}>
                    <i className="fas fa-plus"></i>
                    Create News
                </button>
            </div>

            <DataTable
                columns={columns}
                data={news}
                onEdit={handleEdit}
                onDelete={userRole === 'admin' ? handleDelete : null}
                actions={userRole === 'admin' ? ['edit', 'delete'] : ['edit']}
            />

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingNews ? 'Edit News' : 'Create News'}
                size="large"
            >
                <form onSubmit={handleSubmit} className="event-form">
                    <div className="form-group">
                        <label>Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Excerpt *</label>
                        <textarea
                            value={formData.excerpt}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            rows="2"
                            placeholder="Short summary..."
                            required
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label>Content *</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows="8"
                            required
                        ></textarea>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Author *</label>
                            <input
                                type="text"
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Publish Date *</label>
                            <input
                                type="date"
                                value={formData.publishDate}
                                onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Featured Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files[0])}
                        />
                        {editingNews?.imageUrl && !imageFile && (
                            <img src={editingNews.imageUrl} alt="Current" className="current-image" />
                        )}
                    </div>

                    <div className="form-row">
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.isPublished}
                                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                                />
                                <span>Publish Now</span>
                            </label>
                        </div>

                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.isFeatured}
                                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                />
                                <span>Featured News</span>
                            </label>
                        </div>
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
                                    <i className="fas fa-save"></i>
                                    {editingNews ? 'Update News' : 'Create News'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
});

export default NewsManagement;
