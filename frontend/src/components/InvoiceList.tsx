import React from 'react';
import { ListGroup, Button, Badge, Row, Col } from 'react-bootstrap';
import { CheckCircleFill, Circle } from 'react-bootstrap-icons';
import apiClient from '../api';

interface Invoice {
    id: number;
    filename: string;
    vendor: string;
    amount: number;
    due_date: string;
    is_paid: boolean;
}

interface Props {
    invoices: Invoice[];
    projectId: string;
    fetchProject: () => void;
}

const InvoiceList: React.FC<Props> = ({ invoices, fetchProject }) => {

    const handleUpdateStatus = async (invoiceId: number, newStatus: boolean) => {
        try {
            // This single function now handles both marking as paid and unpaid
            await apiClient.put(`/invoices/${invoiceId}`, { is_paid: newStatus });
            fetchProject(); // Refresh the project data to show the change
        } catch (error) {
            console.error('Failed to update invoice status', error);
            alert('There was an error updating the invoice status.');
        }
    };

    return (
        <ListGroup>
            <ListGroup.Item className="bg-dark fw-bold">
                <Row className="align-items-center">
                    <Col>Vendor</Col>
                    <Col md={3} className="text-center">Amount</Col>
                    <Col md={2} className="text-center">Status</Col>
                    <Col md={3} className="text-end">Action</Col>
                </Row>
            </ListGroup.Item>

            {invoices.length === 0 && (
                <ListGroup.Item className="text-center text-muted p-4">
                    No invoices have been uploaded yet.
                </ListGroup.Item>
            )}

            {invoices.map(invoice => (
                <ListGroup.Item
                    key={invoice.id}
                    className="py-3"
                    style={{
                        backgroundColor: invoice.is_paid ? 'rgba(42, 157, 143, 0.1)' : 'transparent',
                        borderLeft: invoice.is_paid ? '4px solid var(--success-color)' : '4px solid transparent'
                    }}
                >
                    <Row className="align-items-center">
                        <Col>
                            <div className="fw-bold">{invoice.vendor}</div>
                            <small className="text-muted">Due: {new Date(invoice.due_date).toLocaleDateString()}</small>
                        </Col>
                        <Col md={3} className="text-center fw-bold">
                            ${invoice.amount.toLocaleString()}
                        </Col>
                        <Col md={2} className="d-flex justify-content-center">
                            {invoice.is_paid ? (
                                <Badge pill bg="success-subtle" text="success-emphasis" className="d-flex align-items-center">
                                    <CheckCircleFill className="me-1" /> Paid
                                </Badge>
                            ) : (
                                <Badge pill bg="warning-subtle" text="warning-emphasis" className="d-flex align-items-center">
                                    <Circle className="me-1" /> Unpaid
                                </Badge>
                            )}
                        </Col>
                        <Col md={3} className="text-end">
                            {/* THE FIX: Conditionally render the correct button based on invoice status */}
                            {invoice.is_paid ? (
                                <Button variant="outline-secondary" size="sm" onClick={() => handleUpdateStatus(invoice.id, false)}>
                                    Mark as Unpaid
                                </Button>
                            ) : (
                                <Button variant="outline-success" size="sm" onClick={() => handleUpdateStatus(invoice.id, true)}>
                                    Mark as Paid
                                </Button>
                            )}
                        </Col>
                    </Row>
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
};

export default InvoiceList;