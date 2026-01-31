import subprocess
import os

def run_git_command(args, cwd):
    try:
        result = subprocess.run(
            ["git"] + args,
            cwd=cwd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error git command {' '.join(args)}: {e.stderr}")
        raise e

def check_updates():
    """
    Verifica si hay actualizaciones disponibles en la rama main.
    Retorna True si hay cambios, False si está actualizado.
    """
    # Asumimos que el script corre desde desktop_app/ o raíz, buscamos .git subiendo niveles si es necesario
    # Pero para simplificar, usaremos la ruta relativa '../' asumiendo que desktop_app está en la raíz del repo
    # O mejor, buscamos la raiz del proyecto.
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    repo_dir = os.path.dirname(current_dir) # Subimos un nivel desde desktop_app/
    
    print(f"Buscando actualizaciones en {repo_dir}...")
    
    try:
        # 1. Fetch
        run_git_command(["fetch", "origin", "main"], repo_dir)
        
        # 2. Check status (local vs origin/main)
        # rev-list --count HEAD..origin/main
        output = run_git_command(["rev-list", "--count", "HEAD..origin/main"], repo_dir)
        count = int(output)
        
        if count > 0:
            print(f"Hay {count} commits pendientes.")
            return True, f"Hay {count} actualización(es) disponible(s)."
        else:
            print("Sistema actualizado.")
            return False, "El sistema está actualizado."
            
    except Exception as e:
        return False, f"Error verificando actualizaciones: {str(e)}"

def perform_update():
    """
    Ejecuta git pull para actualizar el repositorio.
    """
    current_dir = os.path.dirname(os.path.abspath(__file__))
    repo_dir = os.path.dirname(current_dir)
    
    try:
        run_git_command(["pull", "origin", "main"], repo_dir)
        return True, "Actualización exitosa. Por favor reinicia la aplicación."
    except Exception as e:
        return False, f"Error al actualizar: {str(e)}"
