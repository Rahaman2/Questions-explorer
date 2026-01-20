# Keyword Research Tool

A powerful keyword research tool powered by Google Auto Suggestions API. Get hundreds of keyword suggestions with beautiful visualizations similar to AnswerThePublic.

![Python](https://img.shields.io/badge/Python-3.14-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0.0-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## Features

### Multiple View Modes
- **Visualization View**: Tree-style layout with your keyword at the center and suggestions radiating outward
- **Questions View**: Automatically groups suggestions by question type (What, How, Why, Where, When, Who, Which, Are)
- **Table View**: Classic table format for easy browsing

### Powerful Search
- **Alphabet Soup Technique**: Queries your keyword with a-z appended to get comprehensive suggestions
- **Google Auto Suggestions**: Real-time data from Google's autocomplete API
- **Smart Deduplication**: Automatically removes duplicate suggestions

### Export Options
- **CSV Export**: Download all suggestions as a CSV file
- **Copy to Clipboard**: Copy suggestions in CSV format with one click

### Modern UI
- Clean, responsive design that works on desktop and mobile
- Beautiful gradient themes
- Smooth animations and transitions
- Interactive hover effects

## Installation

### Prerequisites
- Python 3.7 or higher
- pip (Python package manager)

### Setup

1. Clone or download this repository:
```bash
cd keyword-research-tool
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. (Optional) Create a `.env` file for custom configuration:
```bash
cp .env.example .env
```

Edit `.env` to customize settings:
```
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
```

## Usage

### Running the Application

Start the Flask development server:
```bash
python app.py
```

The application will be available at:
- Local: http://127.0.0.1:5000
- Network: http://[your-ip]:5000

### Using the Tool

1. **Enter a keyword** in the search box (e.g., "how to learn", "python programming")
2. **Click Search** and wait for results (this may take 10-30 seconds as it queries a-z variations)
3. **Switch between views** using the tabs:
   - Visualization: See suggestions in a tree layout
   - Questions: View questions grouped by type
   - Table: Browse all suggestions in a table
4. **Export your data**:
   - Click "Copy to Clipboard" to copy suggestions
   - Click "Export CSV" to download as a file

### Example Searches

Good keywords to try:
- `how to learn` - Great for question grouping
- `python` - General keyword with many variations
- `what is` - Populates the "What" category
- `best practices` - Technical suggestions
- `buy online` - E-commerce keywords

## Project Structure

```
keyword-research-tool/
├── app.py                          # Main Flask application entry point
├── config.py                       # Configuration management
├── requirements.txt                # Python dependencies
├── README.md                       # This file
├── .gitignore                      # Git ignore file
├── .env.example                    # Environment variables template
├── app/
│   ├── __init__.py                 # Flask app factory
│   ├── routes/
│   │   ├── __init__.py
│   │   └── keyword_routes.py      # API routes
│   ├── services/
│   │   ├── __init__.py
│   │   └── keyword_service.py     # Google API integration & alphabet soup
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── xml_parser.py          # XML response parser
│   │   └── csv_exporter.py        # CSV generation
│   └── templates/
│       └── keyword_tool.html      # Main UI template
└── static/
    ├── css/
    │   └── style.css               # Styling
    └── js/
        └── main.js                 # Frontend logic
```

## Architecture

### Modular Design
The application follows a modular architecture for easy maintenance and scalability:

- **Routes Layer**: Handles HTTP requests and responses
- **Services Layer**: Contains business logic and API integration
- **Utils Layer**: Reusable utility functions (parsing, exporting)
- **Frontend**: Vanilla JavaScript with no heavy frameworks

### Alphabet Soup Technique
The tool queries Google Auto Suggestions API 27 times per search:
1. Once for the exact keyword
2. 26 times with a-z appended (e.g., "python a", "python b", etc.)

This technique uncovers hundreds of suggestions that wouldn't appear with a simple search.

### API Integration
- **Endpoint**: https://suggestqueries.google.com/complete/search
- **Response Format**: XML
- **Timeout**: 10 seconds per request
- **Error Handling**: Graceful fallback for failed requests

## Configuration

Edit [config.py](config.py) to customize:

```python
class Config:
    GOOGLE_SUGGEST_API = 'https://suggestqueries.google.com/complete/search'
    API_TIMEOUT = 10          # Request timeout in seconds
    MAX_RETRIES = 2           # Number of retry attempts
```

## Troubleshooting

### Slow Search Results
- The alphabet soup technique makes 27 API calls, which can take 10-30 seconds
- This is normal behavior for comprehensive results
- You can modify the service to skip alphabet soup for faster results

### No Suggestions Found
- Try a different keyword
- Check your internet connection
- Google may rate-limit requests from your IP

### Port Already in Use
If port 5000 is already in use, modify [app.py](app.py):
```python
app.run(host='0.0.0.0', port=8080, debug=app.config['DEBUG'])
```

## Future Enhancements (Phase 2)

Planned features for future releases:
- Keyword metrics integration (search volume, CPC, competition)
- Save and manage keyword lists
- Historical search tracking
- Advanced filtering and sorting
- Bulk keyword processing
- API authentication

## Technologies Used

**Backend:**
- Flask 3.0.0 - Web framework
- requests 2.31.0 - HTTP library
- python-dotenv 1.0.0 - Environment management

**Frontend:**
- Vanilla JavaScript (ES6+)
- CSS3 with Grid and Flexbox
- Fetch API for AJAX requests

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Google Auto Suggestions API for providing keyword data
- Inspired by AnswerThePublic's visualization approach
- Built with Flask and modern web technologies

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact the maintainer

---

**Happy Keyword Researching!** 🔍✨
