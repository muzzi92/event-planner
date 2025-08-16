import React from 'react';
import { Link } from 'react-router-dom';
import { ListGroup, Card } from 'react-bootstrap';

interface Project {
    id: number;
    name: string;
    budget: number;
}

interface Props {
    projects: Project[];
}

const ProjectList: React.FC<Props> = ({ projects }) => {
    if (projects.length === 0) {
        return (
            <Card className="text-center p-5 shadow-sm">
                <Card.Body>
                    <Card.Title as="h3">No Projects Found</Card.Title>
                    <Card.Text className="text-muted">
                        Get started by creating your first project.
                    </Card.Text>
                </Card.Body>
            </Card>
        );
    }

    return (
        <ListGroup className="shadow-sm">
            {projects.map((project: Project) => (
                <ListGroup.Item
                    key={project.id}
                    as={Link}
                    to={`/projects/${project.id}`}
                    action
                    className="d-flex justify-content-between align-items-start p-3"
                >
                    <div className="ms-2 me-auto">
                        <div className="fw-bold fs-5">{project.name}</div>
                        <small className="text-muted">Budget: ${project.budget.toLocaleString()}</small>
                    </div>
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
};

export default ProjectList;