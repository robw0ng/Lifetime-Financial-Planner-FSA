import requests
from bs4 import BeautifulSoup
import yaml
import re

# URL to scrape
URL = "https://www.irs.gov/publications/p17#en_US_2024_publink1000283782"
r = requests.get(URL)

# Parse HTML
soup = BeautifulSoup(r.content, 'html.parser')

# Find the correct table
table = soup.find('table', attrs={'summary': 'Table 10-1.Standard Deduction Chart for Most People*'})

# Ensure the table exists
if not table:
    print("❌ Could not find the specified table on the webpage.")
    exit()

table_body = table.find('tbody')

# Function to clean numerical values (remove $ and commas)
def clean_money(value):
    """Removes dollar signs and commas, then converts to int or returns None if empty."""
    if not value or value.strip() == "-":
        return None  # Return None for missing values
    cleaned_value = re.sub(r"[^\d]", "", value)  # Remove all non-numeric characters
    return int(cleaned_value) if cleaned_value else None  # Convert to int if valid

# Extract rows (excluding last row, as per request)
deduction_data = []
rows = table_body.find_all('tr')

for row in rows[:-1]:  # Exclude last row
    cols = row.find_all('td')
    cols = [ele.text.strip() for ele in cols]

    # Ensure row has valid data
    if len(cols) >= 2:  # Adjust based on expected columns
        deduction_data.append({
            "Filing Status": cols[0],
            "Standard Deduction ($)": clean_money(cols[1])
        })

# Define output YAML file
yaml_filename = "standard_deductions.yaml"

# Write to YAML file
with open(yaml_filename, "w", encoding="utf-8") as file:
    yaml.dump(deduction_data, file, default_flow_style=False, sort_keys=False)

print(f"✅ YAML file '{yaml_filename}' has been created successfully.")