import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../apiConfig';
import './Patients.css';

interface Patient {
    id: number;
    first_name: string;
    last_name: string;
    dni: string;
    email: string;
    phone: string;
    birth_date: string;
}

interface PatientsProps {
    token: string;
    onSelectForEval?: (id: number) => void;
}

const Patients: React.FC<PatientsProps> = ({ token, onSelectForEval }) => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        dni: '',
        email: '',
        phone: '',
        birth_date: ''
    });

    const fetchPatients = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/patients/`, {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });
            if (!response.ok) throw new Error('Error al cargar pacientes');
            const data = await response.json();
            setPatients(data);
        } catch (err) {
            setError('No se pudieron cargar los datos de los pacientes.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, [token]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const openModal = (patient: Patient | null = null) => {
        if (patient) {
            setEditingPatient(patient);
            setFormData({
                first_name: patient.first_name,
                last_name: patient.last_name,
                dni: patient.dni,
                email: patient.email || '',
                phone: patient.phone || '',
                birth_date: patient.birth_date || ''
            });
        } else {
            setEditingPatient(null);
            setFormData({ first_name: '', last_name: '', dni: '', email: '', phone: '', birth_date: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingPatient(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingPatient
            ? `${API_BASE_URL}/api/patients/${editingPatient.id}/`
            : `${API_BASE_URL}/api/patients/`;
        const method = editingPatient ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Error al guardar el paciente');

            closeModal();
            fetchPatients();
        } catch (err) {
            alert('Error al guardar el paciente. Por favor, revisá los datos.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de que querés borrar este paciente?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/patients/${id}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`
                }
            });
            if (!response.ok) throw new Error('Error eliminando paciente');
            fetchPatients();
        } catch (err) {
            alert('No se pudo borrar el paciente.');
        }
    };

    if (loading) return <div className="patients-loader">Cargando pacientes...</div>;
    if (error) return <div className="patients-error">{error}</div>;

    return (
        <div className="patients-container">
            <div className="patients-header">
                <h2>Directorio de Pacientes</h2>
                <button className="btn-primary" onClick={() => openModal()}>
                    + Nuevo Paciente
                </button>
            </div>

            <div className="patients-grid">
                {patients.length === 0 ? (
                    <div className="no-patients">No hay pacientes todavía. Agregá uno para empezar.</div>
                ) : (
                    patients.map(patient => (
                        <div key={patient.id} className="patient-card">
                            <button className="btn-evaluar" onClick={() => onSelectForEval && onSelectForEval(patient.id)}>
                                Evaluaciones
                            </button>
                            <div className="patient-info">
                                <h3>{patient.last_name}, {patient.first_name}</h3>
                                <p><strong>DNI:</strong> {patient.dni}</p>
                                {patient.email && <p><strong>Email:</strong> {patient.email}</p>}
                                {patient.phone && <p><strong>Teléfono:</strong> {patient.phone}</p>}
                                {patient.birth_date && <p><strong>Fecha Nacimiento:</strong> {patient.birth_date}</p>}
                            </div>
                            <div className="patient-actions">
                                <button className="btn-secondary" onClick={() => openModal(patient)}>Editar</button>
                                <button className="btn-danger" onClick={() => handleDelete(patient.id)}>Borrar</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{editingPatient ? 'Editar Paciente' : 'Nuevo Paciente'}</h3>
                        <form onSubmit={handleSubmit} className="patient-form">
                            <div className="form-row">
                                <input required type="text" name="first_name" placeholder="Nombre" value={formData.first_name} onChange={handleInputChange} />
                                <input required type="text" name="last_name" placeholder="Apellido" value={formData.last_name} onChange={handleInputChange} />
                            </div>
                            <input required type="text" name="dni" placeholder="DNI" value={formData.dni} onChange={handleInputChange} />
                            <div className="form-row">
                                <input type="email" name="email" placeholder="Correo electrónico" value={formData.email} onChange={handleInputChange} />
                                <input type="tel" name="phone" placeholder="Teléfono" value={formData.phone} onChange={handleInputChange} />
                            </div>
                            <input type="date" name="birth_date" placeholder="Fecha de Nacimiento" value={formData.birth_date} onChange={handleInputChange} />

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={closeModal}>Cancelar</button>
                                <button type="submit" className="btn-primary">Guardar Paciente</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Patients;
