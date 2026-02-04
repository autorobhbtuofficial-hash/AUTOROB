import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './DataTable.css';

const DataTable = ({
    columns,
    data,
    onEdit,
    onDelete,
    onView,
    actions = ['edit', 'delete']
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const itemsPerPage = 10;

    // Filter data based on search
    const filteredData = data.filter(item =>
        Object.values(item).some(value =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Sort data
    const sortedData = React.useMemo(() => {
        let sortableData = [...filteredData];
        if (sortConfig.key) {
            sortableData.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableData;
    }, [filteredData, sortConfig]);

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);

    const handleSort = (key) => {
        setSortConfig({
            key,
            direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
        });
    };

    return (
        <div className="data-table-container">
            {/* Search Bar */}
            <div className="table-controls">
                <div className="search-box">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="table-info">
                    Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedData.length)} of {sortedData.length}
                </div>
            </div>

            {/* Table */}
            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    onClick={() => column.sortable && handleSort(column.key)}
                                    className={column.sortable ? 'sortable' : ''}
                                >
                                    {column.label}
                                    {column.sortable && sortConfig.key === column.key && (
                                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                                    )}
                                </th>
                            ))}
                            {actions.length > 0 && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((item, index) => (
                            <motion.tr
                                key={item.id || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                {columns.map((column) => (
                                    <td key={column.key}>
                                        {column.render ? column.render(item[column.key], item) : item[column.key]}
                                    </td>
                                ))}
                                {actions.length > 0 && (
                                    <td className="actions-cell">
                                        <div className="action-buttons">
                                            {actions.includes('view') && onView && (
                                                <button
                                                    className="btn-icon btn-view interactive"
                                                    onClick={() => onView(item)}
                                                    title="View"
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                            )}
                                            {actions.includes('edit') && onEdit && (
                                                <button
                                                    className="btn-icon btn-edit interactive"
                                                    onClick={() => onEdit(item)}
                                                    title="Edit"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                            )}
                                            {actions.includes('delete') && onDelete && (
                                                <button
                                                    className="btn-icon btn-delete interactive"
                                                    onClick={() => onDelete(item)}
                                                    title="Delete"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </motion.tr>
                        ))}
                    </tbody>
                </table>

                {currentItems.length === 0 && (
                    <div className="no-data">
                        <i className="fas fa-inbox"></i>
                        <p>No data found</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="btn btn-sm interactive"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        <i className="fas fa-chevron-left"></i>
                    </button>

                    <div className="page-numbers">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                className={`btn btn-sm interactive ${currentPage === i + 1 ? 'active' : ''}`}
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    <button
                        className="btn btn-sm interactive"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
            )}
        </div>
    );
};

export default DataTable;
