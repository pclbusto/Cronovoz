import React, { useState, useEffect, useRef } from 'react';
import API_BASE_URL from '../apiConfig';
import Evaluations from './Evaluations';
import './SessionDashboard.css';

interface SessionDashboardProps {
    token: string;
    appointmentId: number;
    patientName: string;
    onClose: () => void;
}

const SessionDashboard: React.FC<SessionDashboardProps> = ({ token, appointmentId, patientName, onClose }) => {
    const [sessionData, setSessionData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Audio recording state
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // View sub-components
    const [showEvaluations, setShowEvaluations] = useState(false);

    useEffect(() => {
        // Fetch or create session attached to appointment
        fetch(`${API_BASE_URL}/api/appointments/${appointmentId}/session/`, {
            headers: { 'Authorization': `Token ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setSessionData(data);
                if (data.voice_note) {
                    // Adjust url if needed, assuming Django returns absolute or relative path
                    setAudioUrl(data.voice_note.startsWith('http') ? data.voice_note : `${API_BASE_URL}${data.voice_note}`);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching session", err);
                setLoading(false);
            });
    }, [appointmentId, token]);

    const handleSaveSession = async () => {
        if (!sessionData) return;

        const formData = new FormData();
        formData.append('status', sessionData.status);
        formData.append('written_notes', sessionData.written_notes || '');

        if (audioBlob) {
            formData.append('voice_note', audioBlob, `session_${sessionData.id}_audio.webm`);
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionData.id}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Token ${token}`
                    // No seteamos Content-Type para que el navegador ponga el boundary multipart correcto
                },
                body: formData
            });

            if (res.ok) {
                alert("Sesión guardada exitosamente");
                const updatedData = await res.json();
                setSessionData(updatedData);
                setAudioBlob(null); // Already saved
            } else {
                alert("Hubo un error al guardar la sesión.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                audioChunksRef.current = []; // reset
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            alert("No se pudo acceder al micrófono.");
            console.error(err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            // Stop all tracks to turn off the red dot in browser
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    if (loading) return <div className="session-dashboard-overlay"><p>Cargando sesión...</p></div>;
    if (!sessionData) return <div className="session-dashboard-overlay"><p>Error cargando sesión</p></div>;

    if (showEvaluations) {
        // Enlazar temporalmente evaluations (requerirá un refactor del componente Evaluations para recibir session id de fondo)
        // Por ahora lo simplificamos mostrando el componente Evaluaciones
        return (
            <div className="session-dashboard-overlay">
                <div className="session-dashboard-content">
                    <button className="btn-secondary" onClick={() => setShowEvaluations(false)}>← Volver a la Sesión</button>
                    <Evaluations token={token} defaultPatientId={sessionData.appointment_patient_id} />
                    {/* Nota: habría que ajustar el Evaluations para inyectar session_id silenciosamente */}
                </div>
            </div>
        );
    }

    return (
        <div className="session-dashboard-overlay">
            <div className="session-dashboard-content">
                <div className="session-header">
                    <h2>Sesión: {patientName}</h2>
                    <button className="btn-close-session" onClick={onClose}>✖ Cerrar</button>
                </div>

                <div className="session-body">
                    {/* Columna Izquierda: Datos y Audio */}
                    <div className="session-sidebar">
                        <div className="form-group">
                            <label>Estado de la Sesión</label>
                            <select
                                value={sessionData.status}
                                onChange={e => setSessionData({ ...sessionData, status: e.target.value })}
                                className="session-status-select"
                            >
                                <option value="pending">Pendiente</option>
                                <option value="realizada">Realizada</option>
                                <option value="ausente">Ausente</option>
                                <option value="cancelada">Cancelada</option>
                            </select>
                        </div>

                        <div className="audio-card">
                            <h3>🎙 Nota de Voz</h3>
                            {!isRecording ? (
                                <button className="btn-record" onClick={startRecording}>🔴 Grabar Audio</button>
                            ) : (
                                <button className="btn-stop" onClick={stopRecording}>⏹ Detener Grabación</button>
                            )}

                            {audioUrl && (
                                <div className="audio-player-container">
                                    <audio controls src={audioUrl} className="audio-player" />
                                    {audioBlob && <span className="unsaved-badge">Sin guardar</span>}
                                </div>
                            )}
                        </div>

                        <div className="evaluations-card">
                            <h3>📝 Evaluaciones</h3>
                            <p>Esta sesión tiene <strong>{sessionData.evaluations_count}</strong> test(s) aplicados.</p>
                            <button className="btn-secondary w-100" onClick={() => setShowEvaluations(true)}>
                                Panel de Evaluaciones
                            </button>
                        </div>
                    </div>

                    {/* Columna Derecha: Texto */}
                    <div className="session-main">
                        <div className="form-group h-100">
                            <label>Observaciones Clínicas (Escritas)</label>
                            <textarea
                                className="session-notes-area"
                                placeholder="Escribe aquí las conclusiones, fonemas trabajados, etc..."
                                value={sessionData.written_notes || ''}
                                onChange={e => setSessionData({ ...sessionData, written_notes: e.target.value })}
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div className="session-footer">
                    <button className="btn-primary btn-large" onClick={handleSaveSession}>
                        💾 Guardar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionDashboard;
