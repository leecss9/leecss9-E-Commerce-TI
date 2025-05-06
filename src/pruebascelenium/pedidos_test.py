from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
import time

service = Service("D:/xaamp/htdocs/E-CommerceTI/src/pruebascelenium/chromedriver.exe")
driver = webdriver.Chrome(service=service)
driver.get("http://localhost:5173")
driver.maximize_window()
time.sleep(2)

# Autenticarse (usuario ya debe estar logueado o sesión iniciada)
icono_usuario = driver.find_element(By.CLASS_NAME, "user-icon-btn")
icono_usuario.click()
time.sleep(1)

# Ir a la sección de pedidos
pedidos_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Mis Pedidos')]")
pedidos_btn.click()
time.sleep(2)

# Verificar pedidos listados
pedidos = driver.find_elements(By.CLASS_NAME, "pedido-card")
assert len(pedidos) > 0, "❌ No se encontraron pedidos."
print(f"✅ Se encontraron {len(pedidos)} pedidos realizados.")

# Mostrar detalles de un pedido
pedido = pedidos[0]
info = pedido.text
print("🧾 Primer pedido:\n", info)

driver.quit()
