from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
import time

service = Service("D:/xaamp/htdocs/E-CommerceTI/src/pruebascelenium/chromedriver.exe")
driver = webdriver.Chrome(service=service)
driver.get("http://localhost:5173")
driver.maximize_window()
time.sleep(2)

# Buscar un producto
barra = driver.find_element(By.CLASS_NAME, "search-bar")
barra.send_keys("Arduino")
barra.submit()
time.sleep(2)

productos = driver.find_elements(By.CLASS_NAME, "product-card")
assert len(productos) > 0, "❌ No se encontraron productos con esa búsqueda."
print(f"✅ Se encontraron {len(productos)} productos relacionados con 'Arduino'.")

# Seleccionar categoría
categoria = driver.find_element(By.XPATH, "//button[contains(text(), 'Sensores')]")
categoria.click()
time.sleep(2)

productos_categoria = driver.find_elements(By.CLASS_NAME, "product-card")
print(f"✅ Productos filtrados por categoría 'Sensores': {len(productos_categoria)}")

driver.quit()
