import csv
from io import StringIO


def generate_csv(suggestions):
    """
    Generate CSV formatted string from suggestions list.

    Args:
        suggestions (list): List of keyword suggestions

    Returns:
        str: CSV formatted string with header
    """
    output = StringIO()
    writer = csv.writer(output)

    # Write header
    writer.writerow(['Keyword Suggestion'])

    # Write each suggestion as a row
    for suggestion in suggestions:
        writer.writerow([suggestion])

    csv_string = output.getvalue()
    output.close()

    return csv_string
