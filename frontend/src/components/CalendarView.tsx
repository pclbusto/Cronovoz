import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import API_BASE_URL from '../apiConfig';
import SessionDashboard from './SessionDashboard';
import './CalendarView.css';

interface Patient {
    id: number;
    first_name: string;
    last_name: string;
    dni: string;
}

interface CalendarViewProps {
    token: string;
    onClose?: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ token, onClose }) => {
    const [events, setEvents] = useState<any[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);

    // Session Modal State
    const [selectedAppointment, setSelectedAppointment] = useState<{ id: number, patientName: string } | null>(null);

    // Recurrence Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        patient_id: '',
        start_date: new Date().toISOString().split('T')[0],
        duration_months: '1',
        time: '14:00:00',
        duration_minutes: '60',
        days_of_week: [] as string[]
    });

    const fetchData = async () => {
        try {
            const headers = { 'Authorization': `Token ${token}` };

            const [apptsRes, ptsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/appointments/`, { headers }),
                fetch(`${API_BASE_URL}/api/patients/`, { headers })
            ]);

            if (apptsRes.ok && ptsRes.ok) {
                const appts = await apptsRes.json();
                const pts = await ptsRes.json();

                setPatients(pts);

                // Map appointments to FullCalendar expected format
                const calendarEvents = appts.map((app: any) => {
                    // FullCalendar needs end time calculated if not provided
                    const startObj = new Date(app.date_time);
                    const endObj = new Date(startObj.getTime() + app.duration_minutes * 60000);

                    let color = '#3b82f6'; // Programado -> Azul
                    if (app.status === 'completed') color = '#10b981'; // Completado -> Verde
                    if (app.status === 'cancelled') color = '#ef4444'; // Cancelado -> Rojo

                    return {
                        id: app.id,
                        title: `${app.patient_name}`,
                        start: startObj.toISOString(),
                        end: endObj.toISOString(),
                        backgroundColor: color,
                        borderColor: color,
                        extendedProps: { ...app }
                    };
                });
                setEvents(calendarEvents);
            }
        } catch (err) {
            console.error('Error fetching calendar data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    const handleEventClick = (clickInfo: any) => {
        const app = clickInfo.event.extendedProps;
        setSelectedAppointment({ id: app.id, patientName: clickInfo.event.title });
    };

    const handleDayToggle = (dayIndex: string) => {
        const currentDays = [...formData.days_of_week];
        if (currentDays.includes(dayIndex)) {
            setFormData({ ...formData, days_of_week: currentDays.filter(d => d !== dayIndex) });
        } else {
            setFormData({ ...formData, days_of_week: [...currentDays, dayIndex] });
        }
    };

    const handleGenerateRecurrence = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.patient_id) {
            alert("Por favor selecciona un paciente.");
            return;
        }
        if (formData.days_of_week.length === 0) {
            alert("Seleccioná al menos un día de la semana.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/treatment-plans/generate_recurrence/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Error al generar los turnos');
            const data = await response.json();
            alert(data.message);
            setIsModalOpen(false);
            fetchData(); // Refresh calendar view

        } catch (err) {
            alert('Error generando los turnos. Revisá los datos.');
        }
    };

    if (loading) return <div style={{ color: 'white', padding: '20px' }}>Cargando agenda...</div>;

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <div className="calendar-header-left">
                    {onClose && (
                        <button className="btn-back-calendar" onClick={onClose}>
                            ← Volver
                        </button>
                    )}
                    <h2>Agenda</h2>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    + Nuevo Tratamiento
                </button>
            </div>

            <div className="calendar-wrapper">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    events={events}
                    eventClick={handleEventClick}
                    locale={esLocale}
                    firstDay={1} // Arranca el Lunes
                    slotMinTime="08:00:00"
                    slotMaxTime="21:00:00"
                    allDaySlot={false}
                    height="auto" // allows the calendar content shrink/grow automatically
                />
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content modal-large">
                        <h3>Programar Tratamiento (Recurrencia)</h3>
                        <p style={{ color: '#cbd5e1', marginBottom: '15px' }}>
                            Esta herramienta generará turnos de forma automática durante todo el período del tratamiento.
                        </p>

                        <form onSubmit={handleGenerateRecurrence} className="recurrence-form">
                            <div className="form-group">
                                <label>Paciente</label>
                                <select
                                    required
                                    value={formData.patient_id}
                                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                                >
                                    <option value="">-- Seleccionar --</option>
                                    {patients.map(p => (
                                        <option key={p.id} value={p.id}>{p.last_name}, {p.first_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Fecha de Inicio</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Duración (Meses)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="12"
                                        required
                                        value={formData.duration_months}
                                        onChange={(e) => setFormData({ ...formData, duration_months: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Días de la semana</label>
                                <div className="days-selector">
                                    {[
                                        { i: '0', n: 'Lunes' }, { i: '1', n: 'Martes' },
                                        { i: '2', n: 'Miércoles' }, { i: '3', n: 'Jueves' },
                                        { i: '4', n: 'Viernes' }, { i: '5', n: 'Sábado' }
                                    ].map(day => (
                                        <label key={day.i} className={`day-chip ${formData.days_of_week.includes(day.i) ? 'selected' : ''}`}>
                                            <input
                                                type="checkbox"
                                                className="hidden-check"
                                                checked={formData.days_of_week.includes(day.i)}
                                                onChange={() => handleDayToggle(day.i)}
                                            /> {day.n}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Horario</label>
                                    <input
                                        type="time"
                                        required
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value + ":00" })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Duración sesión (minutos)</label>
                                    <input
                                        type="number"
                                        min="15"
                                        step="5"
                                        required
                                        value={formData.duration_minutes}
                                        onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="modal-actions" style={{ marginTop: '20px' }}>
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary">Generar Turnos</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedAppointment && (
                <SessionDashboard
                    token={token}
                    appointmentId={selectedAppointment.id}
                    patientName={selectedAppointment.patientName}
                    onClose={() => {
                        setSelectedAppointment(null);
                        fetchData(); // Refrescar los estados "completada / ausente" de los calendarios al cerrar
                    }}
                />
            )}
        </div>
    );
};

export default CalendarView;
