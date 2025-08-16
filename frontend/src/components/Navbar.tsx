import React from 'react';
import { Navbar, Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const AppNavbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
        // You might want to use a more robust state management to trigger a re-render in App.tsx
    };

    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-4" style={{ backgroundColor: 'var(--secondary-color)' }}>
            <Container>
                <Navbar.Brand href="/projects" className="fw-bold" style={{ color: 'var(--accent-color)' }}>
                    EventFlow
                </Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse className="justify-content-end">
                    <Button variant="outline-light" onClick={handleLogout}>Logout</Button>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default AppNavbar;