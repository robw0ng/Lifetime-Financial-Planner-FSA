import requests
from bs4 import BeautifulSoup
import yaml
import re  # Import regex for cleaning numbers

# URL to scrape
URL = "https://www.irs.gov/filing/federal-income-tax-rates-and-brackets"
r = requests.get(URL)

# Parse HTML
soup = BeautifulSoup(r.content, 'html.parser')

# Find the correct table
table = soup.find('table', attrs={'class': 'table complex-table table-striped table-bordered table-responsive'})
table_body = table.find('tbody')

# Function to clean monetary values (removes $ and commas)
def clean_money(value):
    """Removes dollar signs and commas, then converts to int or returns None if empty."""
    if not value or value.strip() == "-":
        return None  # Return None for missing values
    cleaned_value = re.sub(r"[^\d]", "", value)  # Remove all non-numeric characters
    return int(cleaned_value) if cleaned_value else None  # Convert to int if not empty

# Extract rows
tax_data = []
rows = table_body.find_all('tr')

for row in rows:
    cols = row.find_all('td')
    cols = [ele.text.strip() for ele in cols]
    
    # Ensure row has valid data
    if len(cols) == 3:
        tax_data.append({
            "Tax Rate": cols[0],
            "From ($)": clean_money(cols[1]),  # Strip $ and convert
            "To ($)": clean_money(cols[2])    # Strip $ and convert
        })

# Define output YAML file
yaml_filename = "output.yaml"

# Write to YAML file
with open(yaml_filename, "w", encoding="utf-8") as file:
    yaml.dump(tax_data, file, default_flow_style=False, sort_keys=False)

print(f"✅ YAML file '{yaml_filename}' has been created successfully.")
