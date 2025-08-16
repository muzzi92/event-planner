import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import apiClient from '../api';

interface Props {
    show: boolean;
    handleClose: () => void;
    fetchProject: () => void;
    projectId: string;
}

const CreateInvoiceModal: React.FC<Props> = ({ show, handleClose, fetchProject, projectId }) => {
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            await apiClient.post(`/projects/${projectId}/invoices/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            fetchProject();
            handleClose();
        } catch (error) {
            console.error('Failed to upload invoice', error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Upload Invoice</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formInvoiceFile">
                        <Form.Label>Invoice File</Form.Label>
                        <Form.Control
                            type="file"
                            onChange={handleFileChange}
                            required
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Upload
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default CreateInvoiceModal;
