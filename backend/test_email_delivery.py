import os
import sys
import unittest
from unittest.mock import patch, MagicMock

# Ensure backend directory is in python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.email.mailer import (
    is_valid_email,
    get_safe_error_message,
    send_confirmation_email,
    send_team_confirmation_emails
)

class TestEmailDeliverySystem(unittest.TestCase):

    def setUp(self):
        # Set dummy env vars for test environment
        os.environ["SMTP_HOST"] = "smtp.gmail.com"
        os.environ["SMTP_PORT"] = "587"
        os.environ["SMTP_USERNAME"] = "test_user@gmail.com"
        os.environ["SMTP_PASSWORD"] = "secret_smtp_password_123"
        os.environ["SMTP_FROM_EMAIL"] = "notifications@agentxindia.com"

    def tearDown(self):
        pass

    def test_email_validation(self):
        """Test recipient email address validation rules."""
        self.assertTrue(is_valid_email("sivaram54599@gmail.com"))
        self.assertTrue(is_valid_email("sivaramakrishnabevaraa@gmail.com"))
        self.assertFalse(is_valid_email("invalid-email-string"))
        self.assertFalse(is_valid_email("@domain.com"))
        self.assertFalse(is_valid_email("user@.com"))
        self.assertFalse(is_valid_email(""))
        self.assertFalse(is_valid_email(None))

        # Check sending to invalid email directly
        res = send_confirmation_email(
            to_email="invalid-email-format",
            participant_name="Test User",
            team_id="AX2026-001",
            team_name="Test Team",
            member1_name="Test User",
            member2_name="Member 2",
            track_title="Agentic AI"
        )
        self.assertFalse(res["success"])
        self.assertEqual(res["attempts"], 0)
        self.assertEqual(res["error"], "Invalid email address format")

    def test_safe_error_message_masks_password(self):
        """Verify that SMTP_PASSWORD is never leaked in error logs or messages."""
        secret_pwd = os.environ["SMTP_PASSWORD"]
        exception_with_password = Exception(f"Failed login with user test_user@gmail.com and password {secret_pwd}")
        safe_msg = get_safe_error_message(exception_with_password)
        
        self.assertNotIn(secret_pwd, safe_msg)
        self.assertIn("******", safe_msg)

    @patch("smtplib.SMTP")
    def test_successful_email_send(self, mock_smtp_cls):
        """Test successful email send on first attempt."""
        mock_server = MagicMock()
        mock_smtp_cls.return_value = mock_server

        res = send_confirmation_email(
            to_email="sivaramakrishnabevaraa@gmail.com",
            participant_name="Sivaram",
            team_id="AX2026-001",
            team_name="Cyber Sentinels",
            member1_name="Sivaram",
            member2_name="Partner",
            track_title="Agentic AI"
        )

        self.assertTrue(res["success"])
        self.assertEqual(res["attempts"], 1)
        self.assertIsNone(res["error"])
        mock_server.starttls.assert_called_once()
        mock_server.login.assert_called_once_with("test_user@gmail.com", "secret_smtp_password_123")
        mock_server.sendmail.assert_called_once()
        mock_server.quit.assert_called_once()

    @patch("smtplib.SMTP")
    def test_transient_network_error_retry_success(self, mock_smtp_cls):
        """Test retry logic: Attempt 1 & 2 fail with [Errno 101] Network is unreachable, Attempt 3 succeeds."""
        mock_server = MagicMock()
        network_err = OSError(101, "Network is unreachable")
        
        # Side effect: fail twice, succeed on 3rd attempt
        mock_smtp_cls.side_effect = [network_err, network_err, mock_server]

        res = send_confirmation_email(
            to_email="sivaramakrishnabevaraa@gmail.com",
            participant_name="Sivaram",
            team_id="AX2026-001",
            team_name="Cyber Sentinels",
            member1_name="Sivaram",
            member2_name="Partner",
            track_title="Agentic AI",
            max_attempts=3,
            retry_delay=0.01
        )

        self.assertTrue(res["success"])
        self.assertEqual(res["attempts"], 3)
        self.assertIsNone(res["error"])

    @patch("smtplib.SMTP")
    def test_transient_network_error_max_retries_failed(self, mock_smtp_cls):
        """Test max retries (3) reached on persistent network failure."""
        network_err = OSError(101, "Network is unreachable")
        mock_smtp_cls.side_effect = network_err

        res = send_confirmation_email(
            to_email="sivaram54599@gmail.com",
            participant_name="Sivaram",
            team_id="AX2026-001",
            team_name="Cyber Sentinels",
            member1_name="Sivaram",
            member2_name="Partner",
            track_title="Agentic AI",
            max_attempts=3,
            retry_delay=0.01
        )

        self.assertFalse(res["success"])
        self.assertEqual(res["attempts"], 3)
        self.assertIn("Network is unreachable", res["error"])

    @patch("smtplib.SMTP")
    def test_independent_recipient_processing(self, mock_smtp_cls):
        """
        Test that email 1 failure does NOT block email 2 attempt.
        Member 1 (sivaram54599@gmail.com) fails 3 times due to network error.
        Member 2 (sivaramakrishnabevaraa@gmail.com) succeeds on attempt 1.
        """
        mock_server = MagicMock()
        network_err = OSError(101, "Network is unreachable")

        # Calls: 3 fails for Member 1, 1 success for Member 2
        mock_smtp_cls.side_effect = [network_err, network_err, network_err, mock_server]

        results = send_team_confirmation_emails(
            registration_id=1,
            team_id="AX2026-001",
            team_name="Cyber Sentinels",
            track_title="Agentic AI",
            member1_name="Sivaram 1",
            member1_email="sivaram54599@gmail.com",
            member2_name="Sivaram 2",
            member2_email="sivaramakrishnabevaraa@gmail.com",
            max_attempts=3,
            retry_delay=0.01
        )

        self.assertIn("sivaram54599@gmail.com", results)
        self.assertIn("sivaramakrishnabevaraa@gmail.com", results)

        m1_res = results["sivaram54599@gmail.com"]
        m2_res = results["sivaramakrishnabevaraa@gmail.com"]

        self.assertFalse(m1_res["success"])
        self.assertEqual(m1_res["attempts"], 3)

        self.assertTrue(m2_res["success"])
        self.assertEqual(m2_res["attempts"], 1)

    @patch("smtplib.SMTP")
    def test_duplicate_email_prevention(self, mock_smtp_cls):
        """Test duplicate recipient email prevention within same team confirmation."""
        mock_server = MagicMock()
        mock_smtp_cls.return_value = mock_server

        results = send_team_confirmation_emails(
            registration_id=1,
            team_id="AX2026-001",
            team_name="Cyber Sentinels",
            track_title="Agentic AI",
            member1_name="Sivaram",
            member1_email="sivaram54599@gmail.com",
            member2_name="Sivaram Copy",
            member2_email="sivaram54599@gmail.com", # Duplicate email
            max_attempts=3,
            retry_delay=0.01
        )

        # Only one email dispatch should occur
        self.assertEqual(len(results), 1)
        self.assertIn("sivaram54599@gmail.com", results)
        self.assertTrue(results["sivaram54599@gmail.com"]["success"])

    def test_simulation_mode(self):
        """Test simulation fallback mode when credentials are missing or default."""
        os.environ["SMTP_PASSWORD"] = "your_smtp_app_password"

        res = send_confirmation_email(
            to_email="sivaramakrishnabevaraa@gmail.com",
            participant_name="Sivaram",
            team_id="AX2026-001",
            team_name="Cyber Sentinels",
            member1_name="Sivaram",
            member2_name="Partner",
            track_title="Agentic AI"
        )

        self.assertTrue(res["success"])
        self.assertEqual(res["attempts"], 1)
        self.assertIsNone(res["error"])

if __name__ == "__main__":
    unittest.main()
