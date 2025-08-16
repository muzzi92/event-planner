import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, ListGroup, Modal, Spinner, Alert } from 'react-bootstrap';
import { FileEarmarkText, CloudUpload, Eye, Inbox } from 'react-bootstrap-icons';
import apiClient from '../api';

// Define the structure for our documents, matching the backend schema
interface Document {
    id: number;
    filename: string;
    file_type: string;
    summary: string;
    uploaded_at: string; // This will be an ISO date string from the backend
}

interface Props {
    projectId: string;
}

const DocumentsWidget: React.FC<Props> = ({ projectId }) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [aggregatedSummary, setAggregatedSummary] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false); // For upload-specific loading state
    const [error, setError] = useState<string | null>(null);

    // State for modals
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);

    // NEW: Helper function to parse a line for **bold** text
    const parseLineForFormatting = (text: string): React.ReactNode => {
        // Split the text by the bold delimiter.
        // e.g., "This is **important**." becomes ["This is ", "important", "."]
        const parts = text.split('**');

        if (parts.length <= 1) {
            return text; // No bold text found
        }

        return (
            <>
                {parts.map((part, index) => {
                    // Every odd-indexed part was between the asterisks
                    if (index % 2 === 1) {
                        return <strong key={index}>{part}</strong>;
                    }
                    // Even-indexed parts are regular text
                    return part;
                })}
            </>
        );
    };

    // Helper function to format the summary text
    const renderFormattedSummary = (text: string) => {
        if (!text) return null;

        const lines = text.split('\n').filter(line => line.trim() !== '');
        const nodes: React.ReactNode[] = [];
        let i = 0;

        while (i < lines.length) {
            const line = lines[i].trim();
            if (line.startsWith('- ')) {
                const listItems = [];
                // Collect all consecutive list items
                while (i < lines.length && lines[i].trim().startsWith('- ')) {
                    // Remove the '- ' prefix before parsing
                    listItems.push(lines[i].trim().substring(2));
                    i++;
                }
                // Push the entire list
                nodes.push(
                    <ul key={`ul-${nodes.length}`} style={{ paddingLeft: '20px', marginBottom: '1rem' }}>
                        {listItems.map((item, index) => (
                            <li key={index}>{parseLineForFormatting(item)}</li>
                        ))}
                    </ul>
                );
            } else {
                // It's a paragraph
                nodes.push(
                    <p key={`p-${nodes.length}`} className="mb-2">
                        {parseLineForFormatting(line)}
                    </p>
                );
                i++;
            }
        }
        return nodes;
    };

    // Fetches all document data from the backend
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Use Promise.all to fetch documents and the summary concurrently
            const [docsResponse, summaryResponse] = await Promise.all([
                apiClient.get<Document[]>(`/projects/${projectId}/documents/`),
                apiClient.get<{ summary: string }>(`/projects/${projectId}/documents/summary`)
            ]);
            setDocuments(docsResponse.data);
            setAggregatedSummary(summaryResponse.data.summary);
        } catch (err) {
            console.error('Failed to fetch document data', err);
            setError('Could not load document information. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleViewDetails = (doc: Document) => {
        setSelectedDocument(doc);
        setShowDetailModal(true);
    };

    const handleUpload = async () => {
        if (!fileToUpload) return;
        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', fileToUpload);

        try {
            // Call the real upload endpoint
            await apiClient.post(`/projects/${projectId}/documents/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Close modal and refresh data on success
            setShowUploadModal(false);
            setFileToUpload(null);
            await fetchData(); // Refresh the entire widget
        } catch (err: any) {
            console.error('Upload failed', err);
            const errorDetail = err.response?.data?.detail || 'Please ensure it is a supported file type (PDF, DOCX, TXT).';
            setError(`File upload failed. ${errorDetail}`);
            // Keep the modal open so the user can see the error
        } finally {
            setIsUploading(false);
        }
    };

    const handleCloseUploadModal = () => {
        setShowUploadModal(false);
        setError(null); // Clear errors when closing the modal
        setFileToUpload(null);
    }

    return (
        <Card className="shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Intelligent Documents</h4>
                <Button variant="primary" onClick={() => setShowUploadModal(true)}>
                    <CloudUpload className="me-2" /> Upload Document
                </Button>
            </Card.Header>
            <Card.Body>
                {isLoading ? (
                    <div className="text-center p-4"><Spinner animation="border" /></div>
                ) : (
                    <>
                        <Card.Title>AI-Generated Project Overview</Card.Title>
                        <div
                            className="mb-4 p-3 rounded"
                            style={{
                                backgroundColor: 'var(--primary-color)',
                                color: 'var(--text-color)',
                                lineHeight: '1.6',
                                fontSize: '0.9rem'
                            }}
                        >
                            {renderFormattedSummary(aggregatedSummary)}
                        </div>

                        {documents.length > 0 ? (
                            <ListGroup>
                                {documents.map(doc => (
                                    <ListGroup.Item key={doc.id} className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <FileEarmarkText className="me-2" size={20} />
                                            <strong>{doc.filename}</strong>
                                            <small className="ms-3 text-muted">
                                                Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                                            </small>
                                        </div>
                                        <Button variant="outline-light" size="sm" onClick={() => handleViewDetails(doc)}>
                                            <Eye className="me-1" /> View Summary
                                        </Button>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        ) : (
                            <div className="text-center p-4">
                                <Inbox size={40} className="mb-3 text-muted" />
                                <h5>No documents uploaded yet.</h5>
                                <p>Upload contracts, quotes, and emails to get started.</p>
                            </div>
                        )}
                    </>
                )}
            </Card.Body>

            {/* Modal for Viewing Document Details */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{selectedDocument?.filename}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h5>AI-Generated Summary</h5>
                    <p>{selectedDocument?.summary}</p>
                </Modal.Body>
            </Modal>

            {/* Modal for Uploading a New Document */}
            <Modal show={showUploadModal} onHide={handleCloseUploadModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Upload a New Document</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <input className="form-control" type="file" onChange={(e) => setFileToUpload(e.target.files ? e.target.files[0] : null)} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseUploadModal}>Cancel</Button>
                    <Button variant="primary" onClick={handleUpload} disabled={!fileToUpload || isUploading}>
                        {isUploading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Uploading...</> : 'Upload'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Card>
    );
};

export default DocumentsWidget;