import os
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
    # Get the absolute path to the app directory
    basedir = os.path.abspath(os.path.dirname(__file__))
    template_path = os.path.join(basedir, 'templates')
    static_path = os.path.join(basedir, '..', 'static')

    app = Flask(__name__,
                template_folder=template_path,
                static_folder=static_path)

    # Load configuration
    app.config.from_object(config[config_name])

    # Register blueprints
    from app.routes.keyword_routes import keyword_bp
    app.register_blueprint(keyword_bp)

    return app
