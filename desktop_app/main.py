import flet as ft
from views.pacientes_view import PacientesView
from views.evoluciones_view import EvolucionesView
import updater

def main(page: ft.Page):
    page.title = "Cronovoz - Gestión Fonoaudiológica"
    page.theme_mode = ft.ThemeMode.LIGHT

    contenido_principal = ft.Column(expand=True)

    def check_update_click(e):
        page.snack_bar = ft.SnackBar(ft.Text("Buscando actualizaciones..."))
        page.snack_bar.open = True
        page.update()
        
        has_updates, msg = updater.check_updates()
        
        if has_updates:
            def close_dlg(e):
                dlg_result.open = False
                page.update()

            def on_update_confirm(e):
                dlg.open = False
                page.update()
                
                page.snack_bar = ft.SnackBar(ft.Text("Actualizando... espere por favor."))
                page.snack_bar.open = True
                page.update()
                
                ok, update_msg = updater.perform_update()
                
                dlg_result = ft.AlertDialog(
                    title=ft.Text("Resultado de Actualización"),
                    content=ft.Column(
                        [ft.Text(update_msg)], 
                        scroll=ft.ScrollMode.AUTO, 
                        height=300, 
                        tight=True
                    ),
                    actions=[ft.TextButton("Cerrar", on_click=lambda e: close_result_dlg(e))]
                )
                
                def close_result_dlg(e):
                    dlg_result.open = False
                    page.update()

                dlg_result.actions[0].on_click = close_result_dlg
                
                page.dialog = dlg_result
                dlg_result.open = True
                page.update()

            dlg = ft.AlertDialog(
                title=ft.Text("Actualización Disponible"),
                content=ft.Text(msg + "\n¿Desea actualizar ahora?"),
                actions=[
                    ft.TextButton("Cancelar", on_click=lambda e: close_main_dlg(e)),
                    ft.TextButton("Actualizar", on_click=on_update_confirm),
                ],
                actions_alignment=ft.MainAxisAlignment.END,
            )
            
            def close_main_dlg(e):
                dlg.open = False
                page.update()
                
            page.dialog = dlg
            dlg.open = True
            page.update()
        else:
            page.snack_bar = ft.SnackBar(ft.Text(msg))
            page.snack_bar.open = True
            page.update()

    def cambiar_vista(e):
        contenido_principal.controls.clear()
        if rail.selected_index == 0:
            contenido_principal.controls.append(
                ft.Column([
                    ft.Text("Bienvenido al Tablero Principal", size=30),
                    ft.Container(height=20),
                    ft.ElevatedButton(
                        "Buscar Actualizaciones",
                        icon="system_update",
                        on_click=check_update_click
                    )
                ])
            )
        elif rail.selected_index == 1:
            contenido_principal.controls.append(PacientesView())
        elif rail.selected_index == 2:
            contenido_principal.controls.append(EvolucionesView())
        elif rail.selected_index == 3:
             contenido_principal.controls.append(ft.Text("Vista de Prueba para Update", size=30, color="green"))
        page.update()

    rail = ft.NavigationRail(
        selected_index=0,
        label_type=ft.NavigationRailLabelType.ALL,
        min_width=100,
        group_alignment=-0.9,
        destinations=[
            ft.NavigationRailDestination(
                icon=ft.Icons.DASHBOARD_OUTLINED,
                selected_icon=ft.Icons.DASHBOARD,
                label="Inicio"
            ),
            ft.NavigationRailDestination(
                icon=ft.Icons.PEOPLE_OUTLINE,
                selected_icon=ft.Icons.PEOPLE,
                label="Pacientes"
            ),
            ft.NavigationRailDestination(
                icon=ft.Icons.MIC_NONE_OUTLINED,
                selected_icon=ft.Icons.MIC,
                label="Evoluciones"
            ),
            ft.NavigationRailDestination(
                icon=ft.Icons.UPDATE,
                selected_icon=ft.Icons.UPDATE_DISABLED,
                label="Test Update"
            ),
        ],
        on_change=cambiar_vista,
    )

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
    cambiar_vista(None)

if __name__ == "__main__":
    ft.app(target=main)
