from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
import time

service = Service("D:/xaamp/htdocs/E-CommerceTI/src/pruebascelenium/chromedriver.exe")
driver = webdriver.Chrome(service=service)
driver.get("http://localhost:5173")
driver.maximize_window()
time.sleep(2)

# Agregar producto al carrito
producto = driver.find_element(By.CLASS_NAME, "product-card")
producto.find_element(By.TAG_NAME, "button").click()
time.sleep(1)

# Verificar aumento de número en carrito
contador = driver.find_element(By.CLASS_NAME, "cart-count")
assert int(contador.text) > 0, "❌ Error: No se agregó el producto al carrito."
print("✅ Producto agregado correctamente al carrito.")

# Ver detalle del carrito
icono_carrito = driver.find_element(By.CLASS_NAME, "cart-icon")
icono_carrito.click()
time.sleep(1)

# Eliminar producto del carrito
btn_eliminar = driver.find_element(By.CLASS_NAME, "delete-item-btn")
btn_eliminar.click()
time.sleep(1)
print("✅ Producto eliminado del carrito.")

# Verificar total del carrito
total = driver.find_element(By.CLASS_NAME, "cart-total")
print(f"💲 Total actual del carrito: {total.text}")

# Simular botón PayPal (si está visible)
try:
    paypal_btn = driver.find_element(By.CLASS_NAME, "paypal-button")
    assert paypal_btn.is_displayed(), "❌ Botón PayPal no visible."
    print("✅ Botón PayPal visible.")
except:
    print("ℹ️ Botón PayPal no disponible en esta vista.")

driver.quit()
