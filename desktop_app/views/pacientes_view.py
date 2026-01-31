import flet as ft
from database import SessionLocal
from models import Paciente
import datetime

class PacientesView(ft.Column):
    def __init__(self):
        super().__init__()
        self.expand = True
        
        self.dt = ft.DataTable(
            columns=[
                ft.DataColumn(ft.Text("Apellido")),
                ft.DataColumn(ft.Text("Nombre")),
                ft.DataColumn(ft.Text("DNI")),
                ft.DataColumn(ft.Text("Obra Social")),
            ],
            rows=[],
        )

        # Campos del formulario
        self.tf_nombre = ft.TextField(label="Nombre")
        self.tf_apellido = ft.TextField(label="Apellido")
        self.tf_dni = ft.TextField(label="DNI")
        self.tf_obra_social = ft.TextField(label="Obra Social")
        self.tf_fecha_nac = ft.TextField(label="Fecha Nacimiento (YYYY-MM-DD)", value="1990-01-01")

        self.dlg_crear = ft.AlertDialog(
            title=ft.Text("Nuevo Paciente"),
            content=ft.Column([
                self.tf_nombre, self.tf_apellido, self.tf_dni, self.tf_obra_social, self.tf_fecha_nac
            ], tight=True),
            actions=[
                ft.TextButton("Cancelar", on_click=self.cerrar_dialogo),
                ft.TextButton("Guardar", on_click=self.guardar_paciente),
            ],
            actions_alignment=ft.MainAxisAlignment.END,
        )

        self.controls = [
            ft.Row([
                ft.Text("Listado de Pacientes", size=24, weight="bold"),
                ft.IconButton("refresh", on_click=self.cargar_pacientes),
            ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN),
            self.dt,
            ft.FloatingActionButton(
                icon="add",
                on_click=self.abrir_dialogo
            )
        ]
        
        # Cargar datos iniciales
        self.cargar_pacientes(None, update=False)

    def cerrar_dialogo(self, e):
        self.dlg_crear.open = False
        self.page.update()

    def abrir_dialogo(self, e):
        self.page.dialog = self.dlg_crear
        self.dlg_crear.open = True
        self.page.update()

    def guardar_paciente(self, e):
        try:
            db = SessionLocal()
            nuevo = Paciente(
                nombre=self.tf_nombre.value,
                apellido=self.tf_apellido.value,
                dni=self.tf_dni.value,
                obra_social=self.tf_obra_social.value,
                fecha_nacimiento=datetime.datetime.strptime(self.tf_fecha_nac.value, "%Y-%m-%d").date()
            )
            db.add(nuevo)
            db.commit()
            db.close()
            
            self.cerrar_dialogo(None)
            self.cargar_pacientes(None)
            if self.page:
                self.page.show_snack_bar(ft.SnackBar(ft.Text("Paciente guardado exitosamente")))
        except Exception as ex:
            if self.page:
                self.page.show_snack_bar(ft.SnackBar(ft.Text(f"Error: {ex}")))

    def cargar_pacientes(self, e, update=True):
        self.dt.rows.clear()
        db = SessionLocal()
        try:
            pacientes = db.query(Paciente).all()
            for p in pacientes:
                self.dt.rows.append(
                    ft.DataRow(
                        cells=[
                            ft.DataCell(ft.Text(p.apellido)),
                            ft.DataCell(ft.Text(p.nombre)),
                            ft.DataCell(ft.Text(p.dni)),
                            ft.DataCell(ft.Text(p.obra_social or "-")),
                        ]
                    )
                )
        except Exception as ex:
            print(f"Error cargando pacientes: {ex}")
        finally:
            db.close()
        
        if update and self.page:
            self.update()
