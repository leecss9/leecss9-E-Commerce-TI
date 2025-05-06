from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
import time

service = Service("D:/xaamp/htdocs/E-CommerceTI/src/pruebascelenium/chromedriver.exe")
driver = webdriver.Chrome(service=service)
driver.get("http://localhost:5173")
driver.maximize_window()
time.sleep(2)

# Verificar enlaces del Header
header_links = driver.find_elements(By.CSS_SELECTOR, "header a")
for link in header_links:
    print(f"🔗 Enlace encontrado en el Header: {link.text}")

# Verificar enlaces del Footer
driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
time.sleep(1)
footer_links = driver.find_elements(By.CSS_SELECTOR, "footer a")
for link in footer_links:
    print(f"🔗 Enlace encontrado en el Footer: {link.text}")

# Verificar Banner
banner = driver.find_element(By.CLASS_NAME, "banner")
assert banner.is_displayed(), "❌ El banner no se cargó correctamente."
print("✅ El banner se muestra correctamente.")

# Cargar productos desde Tienda
productos = driver.find_elements(By.CLASS_NAME, "product-card")
assert len(productos) > 0, "❌ No se mostraron productos."
print(f"✅ Se cargaron {len(productos)} productos en la tienda.")

driver.quit()
