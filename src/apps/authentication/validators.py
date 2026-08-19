import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

class SymbolValidator:
    """
    Validate that the password contains at least one symbol/special character.
    """
    def validate(self, password, user=None):
        # Symbols are characters that are not alphanumeric and not whitespace.
        if not re.search(r'[^\w\s]', password):
            raise ValidationError(
                _("The password must contain at least one symbol (special character)."),
                code='password_no_symbol',
            )

    def get_help_text(self):
        return _("Your password must contain at least one symbol.")


class NumberValidator:
    """
    Validate that the password contains at least one digit (number).
    """
    def validate(self, password, user=None):
        if not any(char.isdigit() for char in password):
            raise ValidationError(
                _("The password must contain at least one number."),
                code='password_no_number',
            )

    def get_help_text(self):
        return _("Your password must contain at least one number.")
