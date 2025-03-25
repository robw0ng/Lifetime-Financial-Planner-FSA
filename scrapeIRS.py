from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import yaml

# Setup Selenium WebDriver
url = "https://www.irs.gov/publications/p590b"  # Replace with actual URL
driver = webdriver.Chrome()
driver.get(url)

# Wait until tables are present
WebDriverWait(driver, 10).until(EC.presence_of_all_elements_located((By.TAG_NAME, "table")))

# Parse page source with BeautifulSoup
soup = BeautifulSoup(driver.page_source, "html.parser")
driver.quit()

# 🔍 Find the Table by Its `summary` Attribute
table = soup.find("table", summary="Appendix B. Uniform Lifetime Table")

if not table:
    print("❌ Table with specified summary not found. Check the summary text in the HTML.")
    exit()
else:
    print("✅ Correct Table Found!")

# 🔍 Extract Rows
rows = table.find_all("tr")

print(f"Extracting from {len(rows)} rows...")

distribution_data = []
for row in rows:
    cols = row.find_all("td")

    if len(cols) >= 4:
        age1, period1 = cols[0].text.strip(), cols[1].text.strip()
        age2, period2 = cols[2].text.strip(), cols[3].text.strip()

        if age1 and period1:
            distribution_data.append({"age": age1, "distribution_period": period1})
        if age2 and period2:
            distribution_data.append({"age": age2, "distribution_period": period2})

# Save data as YAML
yaml_filename = "uniform_lifetime_table.yaml"
with open(yaml_filename, "w") as file:
    yaml.dump({"Uniform_Lifetime_Table": distribution_data}, file, default_flow_style=False)

print(f"✅ Extracted data saved to {yaml_filename}")
