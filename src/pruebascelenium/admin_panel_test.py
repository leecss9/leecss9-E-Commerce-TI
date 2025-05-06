from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
import time

# Configurar Selenium
service = Service("D:/xaamp/htdocs/E-CommerceTI/src/pruebascelenium/chromedriver.exe")
driver = webdriver.Chrome(service=service)
driver.get("http://localhost:5173")
driver.maximize_window()
time.sleep(2)

# Abrir menú de usuario
icono_usuario = driver.find_element(By.CLASS_NAME, "user-icon-btn")
icono_usuario.click()
time.sleep(1)

# Verificar autenticación
try:
    usuario_nombre = driver.find_element(By.CSS_SELECTOR, ".user-popup h3")
    print(f"👤 Usuario autenticado: {usuario_nombre.text}")

    if "admin" in usuario_nombre.text.lower():
        # Verificar acceso al panel de administrador
        admin_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Panel de Administrador')]")
        admin_btn.click()
        time.sleep(2)

        # Verificar contenido exclusivo del panel
        assert "Panel de Administración" in driver.page_source or "Gestión" in driver.page_source, "❌ No se cargó correctamente el panel."
        print("✅ Acceso al Panel de Administración exitoso.")
    else:
        print("ℹ️ Usuario autenticado no es administrador. Intentando acceder al panel directamente...")
        driver.get("http://localhost:5173/admin")
        time.sleep(2)

        # Verificar redirección o acceso denegado
        assert "acceso denegado" in driver.page_source.lower() or "inicio" in driver.title.lower(), "❌ El cliente accedió al panel sin permisos."
        print("✅ Acceso bloqueado correctamente para usuarios no administradores.")
except:
    print("❌ No se detectó sesión iniciada. Inicia sesión manualmente antes de ejecutar esta prueba.")

driver.quit()
