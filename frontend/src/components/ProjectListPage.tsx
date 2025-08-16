import React, { useState, useEffect, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import apiClient from '../api';
import ProjectList from './ProjectList';
import CreateProjectModal from './CreateProjectModal'; // Import the new modal

interface Project {
    id: number;
    name: string;
    budget: number;
}

const ProjectListPage = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [showModal, setShowModal] = useState(false);

    const fetchProjects = useCallback(async () => {
        try {
            const response = await apiClient.get<Project[]>('/projects/');
            setProjects(response.data);
        } catch (error) {
            console.error('Failed to fetch projects', error);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Projects</h1>
                <Button variant="primary" onClick={() => setShowModal(true)}>
                    Create New Project
                </Button>
            </div>
            <ProjectList projects={projects} />
            <CreateProjectModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                onProjectCreated={fetchProjects}
            />
        </>
    );
};

export default ProjectListPage;