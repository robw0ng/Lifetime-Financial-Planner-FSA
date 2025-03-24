import requests
import yaml
import re
from bs4 import BeautifulSoup

# Function to extract numerical ranges
def extract_range(income_text):
    """Extracts 'from' and 'to' monetary values from the given income range text."""
    numbers = [int(n.replace(",", "")) for n in re.findall(r"\d{1,3}(?:,\d{3})*", income_text)]
    
    if "more than" in income_text and "less than or equal to" in income_text:
        return numbers[0], numbers[1]
    elif "more than" in income_text:
        return numbers[0], None  # Open-ended range (no upper limit)
    elif "less than or equal to" in income_text or "up to" in income_text:
        return 0, numbers[0]  # Starts from 0
    elif len(numbers) == 1:
        return 0, numbers[0]  # Default case for lowest bracket
    else:
        return numbers[0], numbers[1] if len(numbers) > 1 else None

# Function to clean filing status text
def clean_filing_status(status):
    """Removes trailing punctuation and extra words from filing status."""
    return status.replace(" and", "").replace(".", "").strip()

# Function to scrape capital gains tax data from a given URL
def scrape_capital_gains(url):
    print(f"🔍 Fetching data from {url}...")
    response = requests.get(url)

    if response.status_code != 200:
        print(f"❌ Failed to fetch page! Status Code: {response.status_code}")
        return

    soup = BeautifulSoup(response.text, "html.parser")

    # Locate the section containing "Capital gains tax rates"
    capital_gains_section = soup.find("h2", string=lambda text: text and "capital gains tax rates" in text.lower())

    if not capital_gains_section:
        print("❌ Could not find 'Capital gains tax rates' section.")
        return

    capital_gains_data = []

    # Traverse through each tax rate section
    current_element = capital_gains_section.find_next("p")

    while current_element:
        # Extract tax rate from <b> or <strong>
        rate_tag = current_element.find("b") or current_element.find("strong")
        if not rate_tag:
            current_element = current_element.find_next_sibling()
            continue

        tax_rate = rate_tag.text.strip()
        print(f"\n✅ Found Capital Gains Rate: {tax_rate}")

        # Find the next <ul> for income brackets
        ul = current_element.find_next_sibling("ul")
        if not ul:
            print(f"⚠ No <ul> found for {tax_rate}, skipping...")
            current_element = current_element.find_next_sibling()
            continue

        # Extract income brackets from <ul>
        for li in ul.find_all("li"):
            text = li.text.strip()
            if "for" in text:
                parts = text.split(" for ", 1)
                income_range = parts[0].strip()
                filing_status = clean_filing_status(parts[1])

                # Extract monetary ranges
                from_value, to_value = extract_range(income_range)

                print(f"✅ Extracted: {tax_rate}, {filing_status}, From: {from_value}, To: {to_value}")
                capital_gains_data.append({
                    "Tax Rate": tax_rate,
                    "Filing Status": filing_status,
                    "From ($)": from_value,
                    "To ($)": to_value
                })

        # Move to the next paragraph to check for more rates
        current_element = ul.find_next_sibling()

    if not capital_gains_data:
        print("\n❌ No data extracted! The structure may need adjustment.")
        return

    # Save to YAML
    yaml_filename = "capital_gains_rates.yaml"
    with open(yaml_filename, "w", encoding="utf-8") as file:
        yaml.dump(capital_gains_data, file, default_flow_style=False, sort_keys=False)

    print(f"\n✅ Data successfully extracted and saved!")
    print(f"📂 YAML File: {yaml_filename}")

# Example Usage:
url = "http://irs.gov/taxtopics/tc409"  # Replace with the actual IRS URL
scrape_capital_gains(url)
