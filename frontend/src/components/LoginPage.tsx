import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import apiClient from '../api';

interface Props {
    setToken: (token: string) => void;
}

const LoginPage: React.FC<Props> = ({ setToken }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); // Reset error on new submission

        try {
            // This custom transform is necessary for FastAPI's OAuth2PasswordRequestForm
            const response = await apiClient.post('/token', {
                username: email,
                password: password
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                transformRequest: [(data) => {
                    return Object.entries(data)
                        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`)
                        .join('&');
                }]
            });

            const token = response.data.access_token;
            setToken(token);

            // THE FIX: After a successful login, navigate the user to the projects dashboard.
            navigate('/projects');

        } catch (err) {
            console.error('Login failed', err);
            // Provide user-facing feedback for a better experience
            setError('Login failed. Please check your email and password.');
        }
    };

    return (
        <Container style={{ height: '100vh' }} className="d-flex align-items-center justify-content-center">
            <Row>
                <Col>
                    <Card style={{ width: '25rem' }} className="p-4 shadow-lg">
                        <Card.Body>
                            <h1 className="text-center mb-4 fw-bold" style={{ color: 'var(--accent-color)' }}>EventFlow</h1>
                            <h3 className="text-center mb-4">Welcome Back</h3>
                            {error && <Alert variant="danger">{error}</Alert>}
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
                                        Login
                                    </Button>
                                </div>
                            </Form>
                            <p className="mt-4 text-center">
                                Don't have an account? <Link to="/register" style={{ color: 'var(--accent-color)' }}>Register</Link>
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default LoginPage;