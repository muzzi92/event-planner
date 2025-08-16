import React, { useState } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import InvoiceList from './InvoiceList';
import CreateInvoiceModal from './CreateInvoiceModal';
import BudgetChart from './BudgetChart';
import UpcomingInvoices from './UpcomingInvoices';

// Define the interfaces for the data this component will receive
interface Invoice {
    id: number;
    filename: string;
    vendor: string;
    amount: number;
    due_date: string;
    is_paid: boolean;
}

interface Project {
    id: number;
    name: string;
    budget: number;
    invoices: Invoice[];
}

interface Props {
    project: Project;
    fetchProject: () => void;
}

const ProjectFinancialsTab: React.FC<Props> = ({ project, fetchProject }) => {
    const [showModal, setShowModal] = useState(false);

    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    const totalRequested = project.invoices.reduce((a, i) => a + i.amount, 0);
    const totalSpent = project.invoices.filter(i => i.is_paid).reduce((a, i) => a + i.amount, 0);

    return (
        <>
            <div className="d-flex justify-content-end mb-4">
                <Button variant="primary" onClick={handleShow}>Upload Invoice</Button>
            </div>
            <Row>
                <Col md={4}>
                    <Card className="text-center">
                        <Card.Body>
                            <Card.Title>Total Budget</Card.Title>
                            <Card.Text className="h3">${project.budget.toLocaleString()}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center">
                        <Card.Body>
                            <Card.Title>Total Requested</Card.Title>
                            <Card.Text className="h3" style={{ color: 'var(--warning-color)' }}>${totalRequested.toLocaleString()}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center">
                        <Card.Body>
                            <Card.Title>Total Spent</Card.Title>
                            <Card.Text className="h3" style={{ color: 'var(--danger-color)' }}>${totalSpent.toLocaleString()}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row className="mt-4">
                <Col md={7}>
                    <InvoiceList invoices={project.invoices} projectId={String(project.id)} fetchProject={fetchProject} />
                </Col>
                <Col md={5}>
                    <Card>
                        <Card.Body>
                            <BudgetChart project={project} />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row className="mt-4">
                <Col>
                    <UpcomingInvoices project={project} />
                </Col>
            </Row>
            <CreateInvoiceModal show={showModal} handleClose={handleClose} fetchProject={fetchProject} projectId={String(project.id)} />
        </>
    );
};

export default ProjectFinancialsTab;