import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base configuration"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    GOOGLE_SUGGEST_API = 'https://suggestqueries.google.com/complete/search'
    API_TIMEOUT = 10
    MAX_RETRIES = 2

    # Category System Configuration
    CATEGORY_SYSTEM = {
        "Questions": ["who", "what", "where", "when", "why", "how", "are"],
        "Prepositions": ["can", "with", "for"],
        "Comparisons": ["vs", "versus", "or"],
        "Intent_Based": ["buy", "review", "price", "best", "top", "how to", "why to"],
        "Time_Related": ["when", "schedule", "deadline", "today", "now", "latest"],
        "Audience_Specific": ["for beginners", "for small businesses", "for students", "for professionals"],
        "Problem_Solving": ["solution", "issue", "error", "troubleshoot", "fix"],
        "Feature_Specific": ["with video", "with images", "analytics", "tools", "with example"],
        "Opinions_Reviews": ["review", "opinion", "rating", "feedback", "testimonial"],
        "Cost_Related": ["price", "cost", "budget", "cheap", "expensive", "value"],
        "Trend_Based": ["trends", "new", "upcoming"]
    }

    # Category Display Metadata (icons and colors)
    CATEGORY_METADATA = {
        "Questions": {"icon": "❓", "color": "#667eea"},
        "Prepositions": {"icon": "🔗", "color": "#764ba2"},
        "Comparisons": {"icon": "⚖️", "color": "#f093fb"},
        "Intent_Based": {"icon": "🎯", "color": "#4facfe"},
        "Time_Related": {"icon": "⏰", "color": "#43e97b"},
        "Audience_Specific": {"icon": "👥", "color": "#fa709a"},
        "Problem_Solving": {"icon": "🔧", "color": "#30cfd0"},
        "Feature_Specific": {"icon": "⚙️", "color": "#a8edea"},
        "Opinions_Reviews": {"icon": "⭐", "color": "#ffd89b"},
        "Cost_Related": {"icon": "💰", "color": "#19547b"},
        "Trend_Based": {"icon": "📈", "color": "#f5af19"}
    }


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
