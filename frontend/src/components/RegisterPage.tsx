import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Form, Button, Container, Row, Col } from 'react-bootstrap';
import apiClient from '../api';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiClient.post('/users/', {
                email,
                password
            });
            navigate('/login');
        } catch (error) {
            console.error('Registration failed', error);
        }
    };

    return (
        <Container style={{ height: '100vh' }} className="d-flex align-items-center justify-content-center">
            <Row>
                <Col>
                    <Card style={{ width: '25rem' }} className="p-4 shadow-lg">
                        <Card.Body>
                            <h1 className="text-center mb-4 fw-bold" style={{ color: 'var(--accent-color)' }}>EventFlow</h1>
                            <h3 className="text-center mb-4">Create Your Account</h3>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                    <Form.Label>Email address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formBasicPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <div className="d-grid">
                                    <Button variant="primary" type="submit" size="lg">
                                        Register
                                    </Button>
                                </div>
                            </Form>
                            <p className="mt-4 text-center">
                                Already have an account? <Link to="/login" style={{ color: 'var(--accent-color)' }}>Login</Link>
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default RegisterPage;