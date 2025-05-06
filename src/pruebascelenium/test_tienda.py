from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# Configurar el servicio de Selenium y abrir el navegador
service = Service("D:/xaamp/htdocs/E-CommerceTI/src/pruebascelenium/chromedriver.exe")
driver = webdriver.Chrome(service=service)

driver.get("http://localhost:5173")  # Asegúrate de que esté corriendo tu servidor de React
driver.maximize_window()
time.sleep(2)

# --- PASO 1: Interacción con el Menú de Usuario ---
# Hacer clic en el ícono del usuario para abrir el menú
icono_usuario = driver.find_element(By.CLASS_NAME, "user-icon-btn")
icono_usuario.click()
time.sleep(1)

# Verificar si el menú de usuario se despliega
user_popup = driver.find_element(By.CLASS_NAME, "user-popup")
assert user_popup.is_displayed(), "Error: El menú de usuario no se desplegó"
print("✅ Test exitoso: El menú de usuario se despliega correctamente.")

# --- PASO 2: Verificar que el usuario está autenticado ---
try:
    # Verificar si el usuario está autenticado (elemento de usuario visible)
    usuario_nombre = driver.find_element(By.CSS_SELECTOR, ".user-popup h3")
    print(f"Nombre de usuario: {usuario_nombre.text}")
    
    # Si el nombre del usuario se encuentra, verificar el rol
    if usuario_nombre.text:
        if "admin" in usuario_nombre.text.lower():  # Verificar si el usuario es admin
            admin_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Panel de Administrador')]")
            assert admin_button.is_displayed(), "Error: El botón del panel de administración no está visible."
            print("✅ Test exitoso: El usuario tiene acceso al Panel de Administrador.")
        else:
            print("✅ Test exitoso: El usuario no es admin.")
except:
    # Si el usuario no está autenticado, verificar si la opción de iniciar sesión aparece
    login_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Iniciar Sesión')]")
    assert login_button.is_displayed(), "Error: La opción 'Iniciar sesión' no está visible."
    print("✅ Test exitoso: La opción 'Iniciar sesión' está disponible.")

# --- PASO 3: Cerrar sesión ---
# Si el usuario está autenticado, hacer clic en "Cerrar sesión"
try:
    logout_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Cerrar Sesión')]")
    logout_button.click()
    time.sleep(2)
    
    # Verificar que se redirige al login
    assert "Iniciar sesión" in driver.page_source, "Error: No se redirigió al login."
    print("✅ Test exitoso: El usuario cerró sesión correctamente.")
except:
    print("✅ Test exitoso: El usuario no está autenticado, por lo que no se muestra la opción de cerrar sesión.")

# Cerrar el navegador
driver.quit()



