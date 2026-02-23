import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../apiConfig';
import './TestTemplates.css';

interface TestTemplate {
    id: number;
    name: string;
    description: string;
    status: 'draft' | 'active';
    schema: any;
    ui_schema: any;
}

interface TestTemplatesProps {
    token: string;
}

type QuestionType = 'text' | 'number' | 'date' | 'single-choice' | 'multi-choice';

interface QuestionItem {
    id: string; // Unique local ID
    title: string;
    type: QuestionType;
    options: string[]; // Usado solo si es single-choice o multi-choice
    required: boolean;
}

// Trick: we store the visual builder state in ui_schema._builder_questions 
// to avoid having to parse complex JSON Schema back into the visual UI.

const generateId = () => Math.random().toString(36).substr(2, 9);

const TestTemplates: React.FC<TestTemplatesProps> = ({ token }) => {
    const [templates, setTemplates] = useState<TestTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Editor State
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [templateName, setTemplateName] = useState('');
    const [templateDesc, setTemplateDesc] = useState('');
    const [questions, setQuestions] = useState<QuestionItem[]>([]);

    const fetchTemplates = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/test-templates/`, {
                headers: { 'Authorization': `Token ${token}` }
            });
            if (!response.ok) throw new Error('Error al cargar plantillas');
            const data = await response.json();
            setTemplates(data);
        } catch (err) {
            setError('No se pudieron cargar las plantillas de evaluación.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, [token]);

    const openEditor = (template: TestTemplate | null = null) => {
        if (template) {
            setEditingId(template.id);
            setTemplateName(template.name);
            setTemplateDesc(template.description || '');
            const savedQs = template.ui_schema?._builder_questions || [];
            if (savedQs.length > 0) {
                setQuestions(savedQs);
            } else {
                setQuestions([]); // Was created with raw JSON, cannot be edited visually yet without overriding
            }
        } else {
            setEditingId(null);
            setTemplateName('');
            setTemplateDesc('');
            setQuestions([]);
        }
        setIsEditing(true);
    };

    const closeEditor = () => {
        setIsEditing(false);
        setEditingId(null);
    };

    const addQuestion = () => {
        setQuestions([...questions, {
            id: generateId(),
            title: '',
            type: 'text',
            options: ['Opción 1'],
            required: false
        }]);
    };

    const removeQuestion = (qId: string) => {
        setQuestions(questions.filter(q => q.id !== qId));
    };

    const updateQuestion = (qId: string, updates: Partial<QuestionItem>) => {
        setQuestions(questions.map(q => q.id === qId ? { ...q, ...updates } : q));
    };

    const handleOptionChange = (qId: string, optIndex: number, newValue: string) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const newOptions = [...q.options];
                newOptions[optIndex] = newValue;
                return { ...q, options: newOptions };
            }
            return q;
        }));
    };

    const handleAddOption = (qId: string) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                return { ...q, options: [...q.options, `Opción ${q.options.length + 1}`] };
            }
            return q;
        }));
    };

    const handleRemoveOption = (qId: string, optIndex: number) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const newOptions = q.options.filter((_, idx) => idx !== optIndex);
                if (newOptions.length === 0) newOptions.push("Opción 1"); // Keep at least one
                return { ...q, options: newOptions };
            }
            return q;
        }));
    };

    const buildSchema = (qs: QuestionItem[]) => {
        const schema: any = {
            title: templateName || 'Test sin título',
            description: templateDesc,
            type: 'object',
            required: [],
            properties: {}
        };
        const uiSchema: any = {
            _builder_questions: qs // We hide our builder state here
        };

        qs.forEach((q, index) => {
            const key = `question_${index}`;
            if (q.required) schema.required.push(key);

            let prop: any = { title: q.title || `Pregunta ${index + 1}` };

            if (q.type === 'text') {
                prop.type = 'string';
            } else if (q.type === 'number') {
                prop.type = 'number';
            } else if (q.type === 'date') {
                prop.type = 'string';
                prop.format = 'date';
            } else if (q.type === 'single-choice') {
                prop.type = 'string';
                prop.enum = q.options;
                uiSchema[key] = { "ui:widget": "radio" };
            } else if (q.type === 'multi-choice') {
                prop.type = 'array';
                prop.items = { type: 'string', enum: q.options };
                prop.uniqueItems = true;
                uiSchema[key] = { "ui:widget": "checkboxes" };
            }

            schema.properties[key] = prop;
        });

        return { schema, uiSchema };
    };

    const handleSave = async (activate: boolean) => {
        if (!templateName.trim()) {
            alert('Por favor elegí un nombre para el test.');
            return;
        }

        const { schema, uiSchema } = buildSchema(questions);

        const payload = {
            name: templateName,
            description: templateDesc,
            status: activate ? 'active' : 'draft',
            schema,
            ui_schema: uiSchema
        };

        const url = editingId
            ? `${API_BASE_URL}/api/test-templates/${editingId}/`
            : `${API_BASE_URL}/api/test-templates/`;
        const method = editingId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Error al guardar la plantilla');

            closeEditor();
            fetchTemplates();
        } catch (err) {
            alert('Error al guardar la plantilla. Verificá tu conexión.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Seguro que querés borrar este test? Eliminarlo de forma irreversible afectará históricos.')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/test-templates/${id}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Token ${token}` }
            });
            if (!response.ok) throw new Error('Error eliminando');
            fetchTemplates();
        } catch (err) {
            alert('No se pudo borrar el test.');
        }
    };

    if (loading) return <div className="loaderp">Cargando plantillas...</div>;
    if (error) return <div className="errorp">{error}</div>;

    if (isEditing) {
        return (
            <div className="builder-container">
                <div className="builder-header-sticky">
                    <button className="btn-back" onClick={closeEditor}>← Volver</button>
                    <div className="builder-actions">
                        <button className="btn-draft" onClick={() => handleSave(false)}>Guardar Borrador</button>
                        <button className="btn-activate" onClick={() => handleSave(true)}>Activar Test</button>
                    </div>
                </div>

                <div className="builder-content">
                    <input
                        className="builder-title-input"
                        placeholder="Título del Test..."
                        value={templateName}
                        onChange={e => setTemplateName(e.target.value)}
                    />
                    <textarea
                        className="builder-desc-input"
                        placeholder="Descripción opcional del objetivo del test..."
                        value={templateDesc}
                        onChange={e => setTemplateDesc(e.target.value)}
                    />

                    <div className="questions-list">
                        {questions.length === 0 && (
                            <div className="empty-questions">
                                Todavía no hay preguntas. Tocá el botón de abajo para agregar una.
                            </div>
                        )}
                        {questions.map((q, qIndex) => (
                            <div key={q.id} className="question-card">
                                <div className="question-header">
                                    <span className="question-number">#{qIndex + 1}</span>
                                    <button className="btn-remove-q" onClick={() => removeQuestion(q.id)}>✕</button>
                                </div>
                                <input
                                    className="q-title-input"
                                    placeholder="Escribí tu pregunta acá..."
                                    value={q.title}
                                    onChange={e => updateQuestion(q.id, { title: e.target.value })}
                                />

                                <div className="q-settings">
                                    <select
                                        className="q-type-select"
                                        value={q.type}
                                        onChange={e => updateQuestion(q.id, { type: e.target.value as QuestionType })}
                                    >
                                        <option value="text">Texto Libre</option>
                                        <option value="number">Número Entero/Decimal</option>
                                        <option value="single-choice">Elegir una opción (Múltiple Choice)</option>
                                        <option value="multi-choice">Elegir varias opciones (Casillas)</option>
                                        <option value="date">Fecha</option>
                                    </select>

                                    <label className="req-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={q.required}
                                            onChange={e => updateQuestion(q.id, { required: e.target.checked })}
                                        /> Obligatoria
                                    </label>
                                </div>

                                {(q.type === 'single-choice' || q.type === 'multi-choice') && (
                                    <div className="q-options">
                                        {q.options.map((opt, optIndex) => (
                                            <div key={optIndex} className="opt-row">
                                                <div className="opt-bullet"></div>
                                                <input
                                                    className="opt-input"
                                                    value={opt}
                                                    onChange={e => handleOptionChange(q.id, optIndex, e.target.value)}
                                                />
                                                <button className="btn-rem-opt" onClick={() => handleRemoveOption(q.id, optIndex)}>✕</button>
                                            </div>
                                        ))}
                                        <button className="btn-add-opt" onClick={() => handleAddOption(q.id)}>+ Agregar Opción</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="builder-footer-actions">
                        <button className="btn-add-q" onClick={addQuestion}>+ Añadir Pregunta</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="templates-list-container">
            <div className="list-header">
                <h2>Mis Tests</h2>
                <button className="btn-create-test" onClick={() => openEditor()}>+ Crear Test</button>
            </div>

            <div className="tests-grid">
                {templates.length === 0 ? (
                    <div className="no-tests-card">No tenés tests todavía. Empezá a crear uno.</div>
                ) : (
                    templates.map(t => (
                        <div key={t.id} className={`test-card ${t.status === 'draft' ? 'draft' : 'active'}`}>
                            <div className="test-card-content">
                                <span className="status-badge">{t.status === 'draft' ? '✏️ Borrador' : '✅ Activo'}</span>
                                <h3>{t.name}</h3>
                                <p>{t.description || "Sin descripción"}</p>
                            </div>
                            <div className="test-card-actions">
                                <button className="btn-secondary" onClick={() => openEditor(t)}>Editar / Ver</button>
                                <button className="btn-danger" onClick={() => handleDelete(t.id)}>Borrar</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TestTemplates;
