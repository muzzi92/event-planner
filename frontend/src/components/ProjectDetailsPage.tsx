import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, Tab, Spinner } from 'react-bootstrap';
import apiClient from '../api';

// Import the components that will live inside the tabs
import ProjectFinancialsTab from './ProjectFinancialsTab';
import DocumentsWidget from './DocumentsWidget';

// Define the core interfaces needed for this page
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

const ProjectDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [activeTab, setActiveTab] = useState('financials');

    const fetchProject = useCallback(async () => {
        if (!id) return;
        try {
            const response = await apiClient.get<Project>(`/projects/${id}`);
            setProject(response.data);
        } catch (error) {
            console.error('Failed to fetch project', error);
        }
    }, [id]);

    useEffect(() => {
        fetchProject();
    }, [fetchProject]);

    if (!project) {
        return (
            <div className="text-center p-5">
                <Spinner animation="border" />
                <h2 className="mt-3">Loading Project...</h2>
            </div>
        );
    }

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>{project.name}</h1>
            </div>

            <Tabs
                id="project-details-tabs"
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k as string)}
                className="mb-3"
                fill
            >
                <Tab eventKey="financials" title="Financials & Invoices">
                    <div className="mt-4">
                        <ProjectFinancialsTab project={project} fetchProject={fetchProject} />
                    </div>
                </Tab>
                <Tab eventKey="documents" title="Intelligent Documents">
                    <div className="mt-4">
                        {/* The DocumentsWidget is self-contained and only needs the projectId */}
                        <DocumentsWidget projectId={id!} />
                    </div>
                </Tab>
            </Tabs>
        </>
    );
};

export default ProjectDetailsPage;