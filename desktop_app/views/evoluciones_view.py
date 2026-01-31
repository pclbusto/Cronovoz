import flet as ft
from database import SessionLocal
from models import Paciente, Evolucion
from integrations.audio_recorder import AudioRecorder
import datetime
import os

# Directorio donde se guardarán los audios (idealmente configurable)
AUDIO_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "media", "evoluciones")
if not os.path.exists(AUDIO_DIR):
    os.makedirs(AUDIO_DIR)

class EvolucionesView(ft.Column):
    def __init__(self):
        super().__init__()
        self.expand = True
        self.recorder = AudioRecorder(AUDIO_DIR)
        
        self.dt = ft.DataTable(
            columns=[
                ft.DataColumn(ft.Text("Fecha")),
                ft.DataColumn(ft.Text("Paciente")),
                ft.DataColumn(ft.Text("Informe")),
                ft.DataColumn(ft.Text("Audio")),
            ],
            rows=[],
        )

        # Campos del formulario
        self.dd_paciente = ft.Dropdown(label="Seleccionar Paciente", options=[])
        self.tf_informe = ft.TextField(label="Informe de la Sesión", multiline=True, min_lines=3)
        self.txt_status_grabacion = ft.Text("Listo para grabar", color="grey")
        self.btn_grabar = ft.IconButton(
            icon="mic", 
            icon_color="red", 
            tooltip="Iniciar Grabación",
            on_click=self.toggle_grabacion
        )
        self.archivo_grabado = None # Path del archivo temporal

        self.dlg_crear = ft.AlertDialog(
            title=ft.Text("Nueva Evolución"),
            content=ft.Column([
                self.dd_paciente,
                self.tf_informe,
                ft.Row([
                    self.btn_grabar,
                    self.txt_status_grabacion
                ], alignment=ft.MainAxisAlignment.START, vertical_alignment=ft.CrossAxisAlignment.CENTER)
            ], tight=True),
            actions=[
                ft.TextButton("Cancelar", on_click=self.cerrar_dialogo),
                ft.TextButton("Guardar", on_click=self.guardar_evolucion),
            ],
            actions_alignment=ft.MainAxisAlignment.END,
        )

        self.controls = [
            ft.Row([
                ft.Text("Historial de Evoluciones", size=24, weight="bold"),
                ft.IconButton("refresh", on_click=self.cargar_datos),
            ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN),
            self.dt,
            ft.FloatingActionButton(
                icon="add",
                on_click=self.abrir_dialogo
            )
        ]
        
        self.cargar_datos(None, update=False)

    def toggle_grabacion(self, e):
        if not self.recorder.is_recording():
            # Iniciar
            ok, msg = self.recorder.start_recording()
            if ok:
                self.btn_grabar.icon = "stop"
                self.btn_grabar.icon_color = "black"
                self.btn_grabar.tooltip = "Detener Grabación"
                self.txt_status_grabacion.value = "Grabando..."
                self.txt_status_grabacion.color = "red"
            else:
                self.txt_status_grabacion.value = f"Error: {msg}"
        else:
            # Detener
            path, msg = self.recorder.stop_recording()
            self.btn_grabar.icon = "mic"
            self.btn_grabar.icon_color = "red"
            self.btn_grabar.tooltip = "Iniciar Grabación"
            
            if path:
                self.archivo_grabado = path
                self.txt_status_grabacion.value = "Audio grabado correctamente."
                self.txt_status_grabacion.color = "green"
            else:
                self.txt_status_grabacion.value = f"Error: {msg}"
        
        self.dlg_crear.update()

    def cerrar_dialogo(self, e):
        # Asegurar que se detenga la grabación si cierra
        if self.recorder.is_recording():
            self.recorder.stop_recording()
            self.btn_grabar.icon = "mic"
        
        self.dlg_crear.open = False
        self.page.update()

    def abrir_dialogo(self, e):
        # Recargar pacientes
        db = SessionLocal()
        try:
            pacientes = db.query(Paciente).all()
            self.dd_paciente.options = [
                ft.dropdown.Option(key=str(p.id), text=f"{p.apellido}, {p.nombre}") for p in pacientes
            ]
        finally:
            db.close()
        
        self.tf_informe.value = ""
        self.archivo_grabado = None
        self.txt_status_grabacion.value = "Listo para grabar"
        self.txt_status_grabacion.color = "grey"
        
        self.page.dialog = self.dlg_crear
        self.dlg_crear.open = True
        self.page.update()

    def guardar_evolucion(self, e):
        if not self.dd_paciente.value:
            self.txt_status_grabacion.value = "Debe seleccionar un paciente"
            self.dlg_crear.update()
            return

        try:
            db = SessionLocal()
            nueva = Evolucion(
                paciente_id=int(self.dd_paciente.value),
                informe=self.tf_informe.value,
                audio=self.archivo_grabado,
                fecha_registro=datetime.datetime.now()
            )
            db.add(nueva)
            db.commit()
            db.close()
            
            self.cerrar_dialogo(None)
            self.cargar_datos(None)
            
            self.page.snack_bar = ft.SnackBar(ft.Text("Evolución guardada correctamente"))
            self.page.snack_bar.open = True
            self.page.update()
            
        except Exception as ex:
            if self.page:
                self.page.snack_bar = ft.SnackBar(ft.Text(f"Error: {ex}"))
                self.page.snack_bar.open = True
                self.page.update()

    def cargar_datos(self, e, update=True):
        self.dt.rows.clear()
        db = SessionLocal()
        try:
            # Join para traer datos del paciente
            evoluciones = db.query(Evolucion).join(Paciente).order_by(Evolucion.fecha_registro.desc()).all()
            for ev in evoluciones:
                paciente_nombre = f"{ev.paciente.apellido}, {ev.paciente.nombre}" if ev.paciente else "Desconocido"
                has_audio = ft.Icon("play_circle", color="blue") if ev.audio else ft.Text("-")
                
                self.dt.rows.append(
                    ft.DataRow(
                        cells=[
                            ft.DataCell(ft.Text(ev.fecha_registro.strftime("%Y-%m-%d %H:%M"))),
                            ft.DataCell(ft.Text(paciente_nombre)),
                            ft.DataCell(ft.Text(ev.informe or "")),
                            ft.DataCell(has_audio), 
                        ]
                    )
                )
        except Exception as ex:
            print(f"Error cargando evoluciones: {ex}")
        finally:
            db.close()
        
        if update and self.page:
            self.update()
