import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import apiClient from '../api';

interface Props {
    show: boolean;
    handleClose: () => void;
    onProjectCreated: () => void; // Callback to refresh the project list
}

const CreateProjectModal: React.FC<Props> = ({ show, handleClose, onProjectCreated }) => {
    const [name, setName] = useState('');
    const [budget, setBudget] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            await apiClient.post('/projects/', {
                name,
                budget: parseFloat(budget) || 0,
            });
            onProjectCreated(); // Trigger the refresh on the parent component
            handleClose(); // Close the modal on success
        } catch (err) {
            console.error('Failed to create project', err);
            setError('Could not create the project. Please try again.');
        }
    };

    // Reset form state when the modal is closed
    const handleExited = () => {
        setName('');
        setBudget('');
        setError(null);
    };

    return (
        <Modal show={show} onHide={handleClose} onExited={handleExited} centered>
            <Modal.Header closeButton>
                <Modal.Title>Create New Project</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form.Group className="mb-3" controlId="projectName">
                        <Form.Label>Project Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="e.g., Summer Gala 2025"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            autoFocus
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="projectBudget">
                        <Form.Label>Budget ($)</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="e.g., 50000"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit">
                        Create Project
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default CreateProjectModal;