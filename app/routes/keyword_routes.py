from flask import Blueprint, render_template, request, jsonify, make_response
from app.services.keyword_service import get_suggestions
from app.utils.csv_exporter import generate_csv

keyword_bp = Blueprint('keyword', __name__)


@keyword_bp.route('/')
def index():
    """Render the main keyword tool page."""
    return render_template('keyword_tool.html')


@keyword_bp.route('/api/keywords', methods=['POST'])
def search_keywords():
    """
    Process keyword search request and return suggestions.

    Returns:
        JSON response with suggestions or error message
    """
    data = request.get_json()

    if not data or 'keyword' not in data:
        return jsonify({'error': 'No keyword provided'}), 400

    keyword = data['keyword']
    result = get_suggestions(keyword)

    if 'error' in result:
        return jsonify(result), 400

    return jsonify(result), 200


@keyword_bp.route('/api/export-csv', methods=['POST'])
def export_csv():
    """
    Generate and download CSV file with keyword suggestions.

    Returns:
        CSV file download
    """
    data = request.get_json()

    if not data or 'suggestions' not in data:
        return jsonify({'error': 'No suggestions provided'}), 400

    suggestions = data['suggestions']

    if not suggestions:
        return jsonify({'error': 'No suggestions to export'}), 400

    csv_content = generate_csv(suggestions)

    response = make_response(csv_content)
    response.headers['Content-Type'] = 'text/csv'
    response.headers['Content-Disposition'] = 'attachment; filename=keyword_suggestions.csv'

    return response
