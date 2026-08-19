"""
PHASE 1 — Secrets & sensitive information exposure regression tests.

Guarantees that API and error responses can never leak environment variables,
credentials, stack traces, filesystem paths or internal configuration, and
that secrets are only ever sourced from the environment.
"""
import json
import os
from unittest.mock import patch

from django.conf import settings
from django.contrib.auth.models import User
from django.core.exceptions import ImproperlyConfigured
from django.core.exceptions import SuspiciousOperation
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.recruitment import storage
from config import settings as settings_module
from config.exceptions import exception_handler
from config.views import error_500


def _leaky_exception():
    return ValueError(
        "Traceback (most recent call last):\n"
        '  File "C:\\secret\\app\\views.py", line 1, in do_thing\n'
        "SECRET_KEY=leaky-secret\n"
        "DB_PASSWORD=hunter2\n"
        "sqlite:////home/user/app/db.sqlite3\n"
    )


class ExceptionHandlerExposureTests(APITestCase):
    """Unhandled API exceptions must never leak internals to the client."""

    def _call_handler(self):
        exc = _leaky_exception()
        return exception_handler(
            exc,
            {"view": None, "request": None, "args": (), "kwargs": {}},
        )

    @override_settings(DEBUG=False)
    def test_unhandled_exception_never_leaks_in_production(self):
        with self.assertLogs("config.exceptions", level="ERROR"):
            response = self._call_handler()
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertEqual(response.data, {"detail": "Internal server error."})
        content = json.dumps(response.data)
        for marker in (
            "Traceback",
            'File "',
            "views.py",
            "SECRET_KEY",
            "DB_PASSWORD",
            "leaky-secret",
            "hunter2",
            "sqlite://",
            "C:\\",
        ):
            self.assertNotIn(marker, content)

    @override_settings(DEBUG=True)
    def test_unhandled_exception_never_leaks_even_in_debug(self):
        """DEBUG must never be able to expose internals through API errors."""
        with self.assertLogs("config.exceptions", level="ERROR"):
            response = self._call_handler()
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertEqual(response.data, {"detail": "Internal server error."})
        content = json.dumps(response.data)
        for marker in ("Traceback", "SECRET_KEY", "DB_PASSWORD", "leaky-secret", "hunter2"):
            self.assertNotIn(marker, content)

    def test_suspicious_operation_returns_generic_400(self):
        response = exception_handler(
            SuspiciousOperation("DisallowedHost: evil.example.com"),
            {"view": None, "request": None, "args": (), "kwargs": {}},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, {"detail": "Malformed request."})


class ErrorPageExposureTests(APITestCase):
    """Django-level error pages must be generic JSON, not HTML/stack traces."""

    _MARKERS = ("Traceback", 'File "', ".py", "SECRET_KEY", "DB_PASSWORD", "C:\\", "sqlite://")

    @override_settings(DEBUG=False)
    def test_unknown_api_path_returns_generic_json(self):
        response = self.client.get("/api/v1/no-such-endpoint/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json(), {"detail": "Not found."})
        content = response.content.decode()
        for marker in self._MARKERS:
            self.assertNotIn(marker, content)

    @override_settings(DEBUG=False)
    def test_unknown_path_returns_generic_json(self):
        response = self.client.get("/no-such-path/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        content = response.content.decode()
        for marker in self._MARKERS:
            self.assertNotIn(marker, content)

    def test_error_500_view_is_generic(self):
        response = error_500(None)
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertEqual(json.loads(response.content), {"detail": "Internal server error."})
        content = response.content.decode()
        for marker in self._MARKERS:
            self.assertNotIn(marker, content)


class NoSecretsInApiResponsesTests(APITestCase):
    """Normal API responses must never contain credentials or secret values."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="secleak_probe", password="ClientP@ss10"
        )
        self.user.profile.role = "client_user"
        self.user.profile.save()

    def _markers(self):
        markers = [
            "SECRET_KEY",
            "DB_PASSWORD",
            "DB_USER",
            "DB_HOST",
            "Traceback",
            settings.SECRET_KEY,
        ]
        if os.getenv("DB_PASSWORD"):
            markers.append(os.getenv("DB_PASSWORD"))
        return markers

    def test_public_jobs_list_contains_no_secrets(self):
        response = self.client.get("/api/v1/careers/jobs/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        content = response.content.decode()
        for marker in self._markers():
            self.assertNotIn(marker, content)

    def test_login_response_contains_no_secrets(self):
        response = self.client.post(
            reverse("login"),
            {"username": "secleak_probe", "password": "wrong-password"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        content = response.content.decode()
        for marker in self._markers():
            self.assertNotIn(marker, content)


class ResponseContractPreservationTests(APITestCase):
    """Removing sensitive data must not change normal response contracts."""

    def test_login_validation_errors_still_returned(self):
        response = self.client.post(reverse("login"), {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)
        self.assertNotIn("Traceback", response.content.decode())


class SettingsSecretResolutionTests(TestCase):
    """DEBUG is opt-in and SECRET_KEY can never come from a hardcoded value."""

    def test_env_flag_defaults_false(self):
        self.assertFalse(settings_module._env_flag("AUREXION_UNSET_FLAG_XYZ"))
        self.assertFalse(settings_module._env_flag("AUREXION_UNSET_FLAG_XYZ", False))
        self.assertTrue(settings_module._env_flag("AUREXION_UNSET_FLAG_XYZ", True))

    def test_env_flag_accepts_true_values(self):
        for value in ("1", "true", "True", "YES", "on", "ON"):
            with self.subTest(value=value):
                with patch.dict(os.environ, {"AUREXION_TEST_FLAG": value}):
                    self.assertTrue(settings_module._env_flag("AUREXION_TEST_FLAG"))

    def test_env_flag_rejects_everything_else(self):
        for value in ("0", "false", "no", "off", "maybe"):
            with self.subTest(value=value):
                with patch.dict(os.environ, {"AUREXION_TEST_FLAG": value}):
                    self.assertFalse(settings_module._env_flag("AUREXION_TEST_FLAG"))

    def test_secret_key_required_outside_debug(self):
        with patch.dict(os.environ, {}, clear=False):
            os.environ.pop("SECRET_KEY", None)
            with self.assertRaises(ImproperlyConfigured):
                settings_module._resolve_secret_key(debug=False)

    def test_secret_key_dev_fallback_in_debug_is_marked_insecure(self):
        with patch.dict(os.environ, {}, clear=False):
            os.environ.pop("SECRET_KEY", None)
            key = settings_module._resolve_secret_key(debug=True)
            self.assertIn("insecure", key)
            self.assertNotEqual(key, "replace-me")

    def test_secret_key_reads_environment(self):
        with patch.dict(os.environ, {"SECRET_KEY": "env-provided-test-key"}):
            self.assertEqual(
                settings_module._resolve_secret_key(debug=False),
                "env-provided-test-key",
            )

    def test_settings_never_use_known_weak_default(self):
        self.assertTrue(settings.SECRET_KEY)
        self.assertNotEqual(settings.SECRET_KEY, "replace-me")


class StorageServiceRoleKeyTests(TestCase):
    """Storage credentials must prefer a dedicated environment variable."""

    def test_prefers_dedicated_env_var(self):
        with patch.dict(os.environ, {"SUPABASE_SERVICE_ROLE_KEY": "dedicated-storage-key"}):
            self.assertEqual(
                storage._resolve_service_role_key(), "dedicated-storage-key"
            )

    def test_falls_back_to_secret_key_only_for_backwards_compat(self):
        with patch.dict(os.environ, {}, clear=False):
            os.environ.pop("SUPABASE_SERVICE_ROLE_KEY", None)
            self.assertEqual(storage._resolve_service_role_key(), settings.SECRET_KEY)