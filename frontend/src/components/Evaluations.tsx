import React, { useState, useEffect } from 'react';
import Form from '@rjsf/mui';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import validator from '@rjsf/validator-ajv8';
import API_BASE_URL from '../apiConfig';
import './Evaluations.css';

interface Patient {
    id: number;
    first_name: string;
    last_name: string;
    dni: string;
}

interface TestTemplate {
    id: number;
    name: string;
    description: string;
    schema: any;
    ui_schema: any;
}

interface Evaluation {
    id: number;
    patient: number;
    test_template: number;
    date: string;
    results: any;
}

interface EvaluationsProps {
    token: string;
    defaultPatientId?: number | null;
}

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#8b5cf6',
        },
        background: {
            default: 'transparent',
            paper: 'rgba(255, 255, 255, 0.05)',
        }
    },
});

const Evaluations: React.FC<EvaluationsProps> = ({ token, defaultPatientId }) => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [templates, setTemplates] = useState<TestTemplate[]>([]);
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

    const [selectedPatient, setSelectedPatient] = useState<number | ''>(defaultPatientId || '');
    const [selectedTemplate, setSelectedTemplate] = useState<number | ''>('');
    const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
    const [viewMode, setViewMode] = useState<'history' | 'new_test' | 'view_test'>('history');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const activeTemplate = templates.find(t => t.id === selectedTemplate);

    const fetchData = async () => {
        try {
            const headers = { 'Authorization': `Token ${token}` };

            const [ptsRes, tplRes, evalsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/patients/`, { headers }),
                fetch(`${API_BASE_URL}/api/test-templates/`, { headers }),
                fetch(`${API_BASE_URL}/api/evaluations/`, { headers })
            ]);

            if (!ptsRes.ok || !tplRes.ok || !evalsRes.ok) throw new Error('Error al cargar datos');

            setPatients(await ptsRes.json());
            setTemplates(await tplRes.json());
            setEvaluations(await evalsRes.json());
        } catch (err) {
            setError('No se pudieron cargar los datos de evaluaciones.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    useEffect(() => {
        if (defaultPatientId) {
            setSelectedPatient(defaultPatientId);
            setViewMode('history');
        }
    }, [defaultPatientId]);

    const handleSubmit = async ({ formData }: any) => {
        if (!selectedPatient || !selectedTemplate) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/evaluations/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify({
                    patient: selectedPatient,
                    test_template: selectedTemplate,
                    results: formData
                })
            });

            if (!response.ok) throw new Error('Error al guardar la evaluación');

            alert('¡Evaluación guardada exitosamente!');
            setSelectedTemplate('');
            setViewMode('history'); // Volver al historial automáticamente al guardar
            fetchData(); // Refresh history
        } catch (err) {
            alert('Hubo un error al guardar la evaluación.');
        }
    };

    const patientEvaluations = evaluations.filter(ev => ev.patient === selectedPatient);
    const selectedPatientData = patients.find(p => p.id === selectedPatient);

    if (loading) return <div className="eval-loader">Cargando módulo de evaluaciones...</div>;
    if (error) return <div className="eval-error">{error}</div>;

    return (
        <div className="evaluations-container">
            <div className="eval-header">
                <h2>Evaluaciones Clínicas</h2>
            </div>

            <div className="eval-controls card" style={{ marginBottom: '20px' }}>
                <div className="select-group">
                    <label>Seleccionar Paciente</label>
                    <select
                        value={selectedPatient}
                        onChange={(e) => {
                            setSelectedPatient(Number(e.target.value) || '');
                            setViewMode('history');
                        }}
                    >
                        <option value="">-- Elegir Paciente --</option>
                        {patients.map(p => (
                            <option key={p.id} value={p.id}>{p.last_name}, {p.first_name} ({p.dni})</option>
                        ))}
                    </select>
                </div>
            </div>

            {!selectedPatient && (
                <div className="no-history">Seleccioná un paciente para ver su historial o realizar un nuevo test.</div>
            )}

            {selectedPatient && viewMode === 'history' && (
                <div className="eval-history">
                    <div className="history-header">
                        <h3>Historial de Evaluaciones de {selectedPatientData?.first_name} {selectedPatientData?.last_name}</h3>
                        <button className="btn-primary" onClick={() => setViewMode('new_test')}>
                            + Nuevo Test
                        </button>
                    </div>

                    <div className="history-grid">
                        {patientEvaluations.length === 0 ? (
                            <div className="no-history">No hay evaluaciones registradas para este paciente.</div>
                        ) : (
                            patientEvaluations.map(ev => {
                                const template = templates.find(t => t.id === ev.test_template);
                                return (
                                    <div
                                        key={ev.id}
                                        className="history-card glass-panel"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => {
                                            setSelectedTemplate(ev.test_template);
                                            setSelectedEvaluation(ev);
                                            setViewMode('view_test');
                                        }}
                                    >
                                        <h4>{template?.name || 'Test Desconocido'}</h4>
                                        <p><strong>Fecha:</strong> {new Date(ev.date).toLocaleDateString()}</p>
                                        <button className="btn-secondary" style={{ marginTop: '10px', fontSize: '12px', padding: '4px 8px' }}>
                                            Ver Resultados
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {selectedPatient && viewMode === 'new_test' && (
                <div className="new-test-container">
                    <div style={{ marginBottom: '20px' }}>
                        <button className="btn-secondary" onClick={() => setViewMode('history')}>
                            ← Volver al historial
                        </button>
                    </div>

                    <div className="eval-controls card" style={{ marginBottom: '30px' }}>
                        <div className="select-group">
                            <label>Seleccionar Test a realizar</label>
                            <select
                                value={selectedTemplate}
                                onChange={(e) => setSelectedTemplate(Number(e.target.value) || '')}
                            >
                                <option value="">-- Elegir Test --</option>
                                {templates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {activeTemplate && (
                        <div className="eval-form-container card glass-panel">
                            <h3>Test Activo: {activeTemplate.name}</h3>
                            <p className="template-desc">{activeTemplate.description}</p>
                            <div className="schema-form-wrapper">
                                <ThemeProvider theme={darkTheme}>
                                    <CssBaseline />
                                    <Form
                                        schema={activeTemplate.schema}
                                        uiSchema={activeTemplate.ui_schema || {}}
                                        validator={validator}
                                        onSubmit={handleSubmit}
                                        showErrorList={false}
                                    />
                                </ThemeProvider>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {selectedPatient && viewMode === 'view_test' && selectedEvaluation && activeTemplate && (
                <div className="view-test-container">
                    <div style={{ marginBottom: '20px' }}>
                        <button className="btn-secondary" onClick={() => setViewMode('history')}>
                            ← Volver al historial
                        </button>
                    </div>

                    <div className="eval-form-container card glass-panel">
                        <h3>Resultados: {activeTemplate.name}</h3>
                        <p className="template-desc">Realizado el {new Date(selectedEvaluation.date).toLocaleDateString()}</p>
                        <div className="schema-form-wrapper readonly-form">
                            <ThemeProvider theme={darkTheme}>
                                <CssBaseline />
                                <Form
                                    schema={activeTemplate.schema}
                                    uiSchema={{ ...activeTemplate.ui_schema, "ui:readonly": true }}
                                    formData={selectedEvaluation.results}
                                    validator={validator}
                                    readonly={true}
                                    children={<></>} /* Esconde el botón de submit */
                                />
                            </ThemeProvider>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Evaluations;
