import requests
from config import Config
from app.utils.xml_parser import parse_xml_response


def fetch_google_suggestions(query):
    """
    Fetch keyword suggestions from Google Auto Suggestions API.

    Args:
        query (str): Search query

    Returns:
        list: List of suggestions

    Raises:
        Exception: If API request fails
    """
    url = Config.GOOGLE_SUGGEST_API
    params = {'client': 'toolbar', 'q': query}

    try:
        response = requests.get(url, params=params, timeout=Config.API_TIMEOUT)
        response.raise_for_status()
        return parse_xml_response(response.text)
    except requests.Timeout:
        raise Exception("API request timed out. Please try again.")
    except requests.RequestException as e:
        raise Exception(f"API request failed: {str(e)}")


def perform_alphabet_soup(keyword):
    """
    Perform alphabet soup technique: query keyword with a-z appended.

    Args:
        keyword (str): Base keyword

    Returns:
        list: Deduplicated list of all suggestions
    """
    alphabet = 'abcdefghijklmnopqrstuvwxyz'
    all_suggestions = []

    # Original query
    try:
        suggestions = fetch_google_suggestions(keyword)
        all_suggestions.extend(suggestions)
    except Exception:
        pass

    # Query with each letter appended
    for letter in alphabet:
        query = f"{keyword} {letter}"
        try:
            suggestions = fetch_google_suggestions(query)
            all_suggestions.extend(suggestions)
        except Exception:
            continue

    # Deduplicate while preserving order
    seen = set()
    unique_suggestions = []
    for suggestion in all_suggestions:
        if suggestion not in seen:
            seen.add(suggestion)
            unique_suggestions.append(suggestion)

    return unique_suggestions


def get_suggestions(keyword):
    """
    Main function to get keyword suggestions using alphabet soup technique.

    Args:
        keyword (str): User's search keyword

    Returns:
        dict: Dictionary with 'suggestions' list or 'error' message
    """
    if not keyword or not keyword.strip():
        return {'error': 'Please enter a keyword'}

    keyword = keyword.strip()

    try:
        suggestions = perform_alphabet_soup(keyword)

        if not suggestions:
            return {'error': 'No suggestions found for this keyword'}

        return {'suggestions': suggestions}
    except Exception as e:
        return {'error': str(e)}
