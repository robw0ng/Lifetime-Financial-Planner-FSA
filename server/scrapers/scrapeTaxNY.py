from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import yaml

# URL of the webpage (replace with actual)
url = "https://www.tax.ny.gov/forms/html-instructions/2022/it/it201i-2022.htm#nys-tax-rate-schedule"  # Replace with actual URL

# Initialize WebDriver
driver = webdriver.Chrome()  # Ensure chromedriver is installed
driver.get(url)

# Wait for the tables to load
table_ids = ["table-28", "table-29", "table-30"]
filing_statuses = [
    "Married filing jointly and qualifying",
    "Single and married filing separately",
    "Head of household"
]

WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.ID, table_ids[-1]))  # Wait for last table
)

# Parse with BeautifulSoup
soup = BeautifulSoup(driver.page_source, "html.parser")
driver.quit()  # Close Selenium

# Store extracted data
all_tax_data = []

for idx, table_id in enumerate(table_ids):
    table = soup.find("table", {"id": table_id})
    if not table:
        print(f"Table {table_id} not found, skipping...")
        continue

    filing_status = filing_statuses[idx]
    rows = table.find("tbody").find_all("tr")
    tax_brackets = []

    for row in rows[2:]:  # Skip header rows
        cols = [td.text.strip().replace(",", "") for td in row.find_all("td")]

        # Remove non-numeric text like "plus" or "of the excess over"
        cols = [c for c in cols if c.lower() not in ["plus", "of the excess over"]]

        if len(cols) < 5:
            continue  # Skip incomplete rows

        try:
            lower_bound = int(cols[0][1:]) if cols[0].startswith("$") else int(cols[0])
            upper_bound = int(cols[1][1:]) if cols[1].startswith("$") else None
            base_tax = float(cols[2].replace("$", "")) if cols[2].startswith("$") else 0
            additional_rate = round(float(cols[3].replace("%", "")) / 100, 4) if "%" in cols[3] else 0
            excess_over = int(cols[4][1:]) if len(cols) > 4 and cols[4].startswith("$") else lower_bound

            # Ensure last bracket has `null` as its upper bound
            if len(tax_brackets) > 0 and tax_brackets[-1]["range"][1] is None:
                tax_brackets[-1]["range"][1] = lower_bound  # Fix previous row's upper bound

            # Append structured tax bracket
            tax_brackets.append({
                "filing_status": filing_status,
                "range": [lower_bound, upper_bound],
                "base_tax": base_tax,
                "additional_rate": additional_rate,
                "excess_over": excess_over
            })

        except ValueError as e:
            print(f"Skipping row due to error: {e}")
            print(f"Problematic row data: {cols}")
            continue

    # Fix the last bracket's upper bound to be None (open-ended)
    if len(tax_brackets) > 1:
        tax_brackets[-1]["range"][1] = None

    # Store data for this table
    all_tax_data.extend(tax_brackets)

# Save as YAML
yaml_filename = "tax_brackets.yaml"
with open(yaml_filename, "w") as file:
    yaml.dump(all_tax_data, file, default_flow_style=False)

print(f"Extracted tax data saved to {yaml_filename}")
