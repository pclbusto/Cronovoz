import React, { useState } from 'react';
import './Auth.css';
import API_BASE_URL from '../apiConfig';

interface AuthProps {
    onLogin: (token: string, user: any) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        firstName: '',
        lastName: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const url = isLogin
            ? `${API_BASE_URL}/api/auth/login/`
            : `${API_BASE_URL}/api/auth/register/`;

        const body = isLogin
            ? { username: formData.username, password: formData.password }
            : {
                username: formData.username,
                password: formData.password,
                email: formData.email,
                first_name: formData.firstName,
                last_name: formData.lastName
            };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (response.ok) {
                if (isLogin) {
                    onLogin(data.token, { username: formData.username });
                } else {
                    // After register, automatically login or switch to login
                    setIsLogin(true);
                    setError('¡Cuenta creada! Por favor, ingresá.');
                }
            } else {
                setError(data.non_field_errors?.[0] || data.username?.[0] || 'Error en la autenticación');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>{isLogin ? '¡Bienvenido de nuevo!' : 'Creá tu cuenta'}</h2>
                    <p>{isLogin ? 'Ingresá tus datos para continuar' : 'Únite a Cronovoz hoy mismo'}</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <input
                            type="text"
                            name="username"
                            placeholder="Usuario"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {!isLogin && (
                        <>
                            <div className="input-group">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Correo electrónico"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="input-row">
                                <div className="input-group">
                                    <input
                                        type="text"
                                        name="firstName"
                                        placeholder="Nombre"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        name="lastName"
                                        placeholder="Apellido"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="input-group">
                        <input
                            type="password"
                            name="password"
                            placeholder="Contraseña"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Cargando...' : (isLogin ? 'Ingresar' : 'Registrarse')}
                    </button>
                </form>

                <div className="auth-switch">
                    <p>
                        {isLogin ? "¿No tenés cuenta?" : "¿Ya tenés una cuenta?"}
                        <button
                            type="button"
                            className="switch-btn"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                        >
                            {isLogin ? 'Crear una' : 'Ingresar'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;
