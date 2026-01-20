import xml.etree.ElementTree as ET


def parse_xml_response(xml_string):
    """
    Parse Google Auto Suggestions XML response and extract suggestions.

    Args:
        xml_string (str): XML response from Google API

    Returns:
        list: List of suggestion strings

    Raises:
        Exception: If XML parsing fails
    """
    try:
        root = ET.fromstring(xml_string)
        suggestions = []

        # Find all CompleteSuggestion elements
        for complete_suggestion in root.findall('CompleteSuggestion'):
            suggestion_elem = complete_suggestion.find('suggestion')
            if suggestion_elem is not None:
                data = suggestion_elem.get('data')
                if data:
                    suggestions.append(data)

        return suggestions
    except ET.ParseError as e:
        raise Exception(f"Failed to parse XML response: {str(e)}")
    except Exception as e:
        raise Exception(f"Error extracting suggestions: {str(e)}")
