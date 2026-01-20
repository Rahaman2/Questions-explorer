from flask import Flask
from config import config


def create_app(config_name='default'):
    """
    Flask application factory.

    Args:
        config_name (str): Configuration name (development, production, default)

    Returns:
        Flask: Configured Flask application
    """
    app = Flask(__name__,
                template_folder='templates',
                static_folder='../static')

    # Load configuration
    app.config.from_object(config[config_name])

    # Register blueprints
    from app.routes.keyword_routes import keyword_bp
    app.register_blueprint(keyword_bp)

    return app
