"""
Category Service - Handles categorization of suggestions and metrics calculation
"""

from flask import current_app


class CategoryService:
    """Service for categorizing keyword suggestions and calculating analytics"""

    def __init__(self):
        """Initialize the category service with configuration from Flask app"""
        self.category_system = current_app.config.get('CATEGORY_SYSTEM', {})

    def categorize_suggestions(self, suggestions):
        """
        Categorize a list of suggestions and calculate metrics

        Args:
            suggestions (list): List of keyword suggestion strings

        Returns:
            dict: {
                "categories": {
                    "Questions": ["suggestion1", ...],
                    "Intent_Based": ["suggestion2", ...],
                    ...
                },
                "metrics": {
                    "total": 150,
                    "Questions": {"count": 45, "percentage": 30.0},
                    ...
                }
            }
        """
        if not suggestions:
            return {
                "categories": {category: [] for category in self.category_system.keys()},
                "metrics": {
                    "total": 0,
                    **{category: {"count": 0, "percentage": 0.0} for category in self.category_system.keys()}
                }
            }

        # Initialize categories dictionary
        categories = {category: [] for category in self.category_system.keys()}

        # Categorize each suggestion
        for suggestion in suggestions:
            matching_categories = self.match_to_categories(suggestion)
            for category in matching_categories:
                if suggestion not in categories[category]:  # Avoid duplicates within same category
                    categories[category].append(suggestion)

        # Calculate metrics
        metrics = self.calculate_metrics(categories, len(suggestions))

        return {
            "categories": categories,
            "metrics": metrics
        }

    def match_to_categories(self, suggestion):
        """
        Match a single suggestion to one or more categories

        Args:
            suggestion (str): A single keyword suggestion

        Returns:
            list: List of category names that match this suggestion
        """
        if not suggestion:
            return []

        matching_categories = []
        suggestion_lower = suggestion.lower()

        for category_name, keywords in self.category_system.items():
            # Check if any keyword from this category is in the suggestion
            if any(keyword.lower() in suggestion_lower for keyword in keywords):
                matching_categories.append(category_name)

        return matching_categories

    def calculate_metrics(self, categorized_data, total_suggestions):
        """
        Calculate counts and percentages for each category

        Args:
            categorized_data (dict): Dictionary mapping category names to suggestion lists
            total_suggestions (int): Total number of original suggestions

        Returns:
            dict: Metrics including total count and per-category statistics
        """
        metrics = {
            "total": total_suggestions
        }

        for category_name, suggestions in categorized_data.items():
            count = len(suggestions)
            percentage = (count / total_suggestions * 100) if total_suggestions > 0 else 0.0

            metrics[category_name] = {
                "count": count,
                "percentage": round(percentage, 1)
            }

        return metrics
