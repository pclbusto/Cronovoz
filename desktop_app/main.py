import flet as ft
from views.pacientes_view import PacientesView

def main(page: ft.Page):
    page.title = "Cronovoz - Gestión Fonoaudiológica"
    page.theme_mode = ft.ThemeMode.LIGHT
    
    # Contenedor para las vistas
    contenido_principal = ft.Column(expand=True)

    def cambiar_vista(e):
        indice = rail.selected_index
        contenido_principal.controls.clear()
        
        if indice == 0:
            contenido_principal.controls.append(ft.Text("Bienvenido al Tablero Principal", size=30))
        elif indice == 1:
            contenido_principal.controls.append(PacientesView())
        
        page.update()

    rail = ft.NavigationRail(
        selected_index=0,
        label_type=ft.NavigationRailLabelType.ALL,
        min_width=100,
        min_extended_width=400,
        # leading=ft.FloatingActionButton(icon=ft.icons.CREATE, text="Nuevo"),
        group_alignment=-0.9,
        destinations=[
            ft.NavigationRailDestination(
                icon="dashboard_rounded", 
                selected_icon="dashboard", 
                label="Inicio"
            ),
            ft.NavigationRailDestination(
                icon="people_outline", 
                selected_icon="people", 
                label="Pacientes"
            ),
        ],
        on_change=cambiar_vista,
    )

    print("Inicializando UI...")
    page.add(
        ft.Row(
            [
                rail,
                ft.VerticalDivider(width=1),
                contenido_principal,
            ],
            expand=True,
        )
    )
    print("UI base agregada. Cargando vista inicial...")

    # Cargar vista inicial
    cambiar_vista(None)
    print("Vista inicial cargada.")

if __name__ == "__main__":
    print("Iniciando aplicación...")
    ft.app(target=main)
