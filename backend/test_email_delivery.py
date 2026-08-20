import os
import sys
import unittest
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.email.mailer import (
    is_valid_email,
    get_safe_error_message,
    send_confirmation_email,
    send_team_confirmation_emails,
    get_email_provider,
    ResendEmailProvider,
    SMTPEmailProvider,
    SimulationEmailProvider
)

class TestResendHTTPSAndEmailDelivery(unittest.TestCase):

    def setUp(self):
        self.original_env = dict(os.environ)

    def tearDown(self):
        os.environ.clear()
        os.environ.update(self.original_env)

    def test_email_validation(self):
        """Test recipient email address syntax validation."""
        self.assertTrue(is_valid_email("sivaram54599@gmail.com"))
        self.assertTrue(is_valid_email("sivaramakrishnabevaraa@gmail.com"))
        self.assertFalse(is_valid_email("invalid-email-string"))
        self.assertFalse(is_valid_email("@domain.com"))
        self.assertFalse(is_valid_email("user@.com"))
        self.assertFalse(is_valid_email(""))
        self.assertFalse(is_valid_email(None))

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

    def test_provider_factory_selection(self):
        """Test active provider selection based on environment variables."""
        # 1. Resend Provider selected when RESEND_API_KEY is present
        os.environ["RESEND_API_KEY"] = "re_test_key_12345"
        provider = get_email_provider()
        self.assertIsInstance(provider, ResendEmailProvider)

        # 2. SMTP Provider selected when RESEND_API_KEY is absent but SMTP credentials present
        del os.environ["RESEND_API_KEY"]
        os.environ["SMTP_USERNAME"] = "user@test.com"
        os.environ["SMTP_PASSWORD"] = "smtp_pass_123"
        provider = get_email_provider()
        self.assertIsInstance(provider, SMTPEmailProvider)

        # 3. Simulation Provider selected when no credentials set
        del os.environ["SMTP_USERNAME"]
        del os.environ["SMTP_PASSWORD"]
        provider = get_email_provider()
        self.assertIsInstance(provider, SimulationEmailProvider)

    def test_safe_error_message_masks_keys_and_passwords(self):
        """Verify that RESEND_API_KEY and SMTP_PASSWORD are never leaked in error messages."""
        os.environ["RESEND_API_KEY"] = "re_secret_resend_api_key_8899"
        os.environ["SMTP_PASSWORD"] = "secret_smtp_pass_9988"

        err = Exception("Failed call with key re_secret_resend_api_key_8899 and pass secret_smtp_pass_9988")
        safe_msg = get_safe_error_message(err)

        self.assertNotIn("re_secret_resend_api_key_8899", safe_msg)
        self.assertNotIn("secret_smtp_pass_9988", safe_msg)
        self.assertIn("re_******", safe_msg)
        self.assertIn("******", safe_msg)

    @patch("requests.post")
    def test_resend_successful_email_send(self, mock_post):
        """Test successful HTTPS email dispatch via Resend API."""
        os.environ["RESEND_API_KEY"] = "re_valid_api_key_123"
        os.environ["EMAIL_FROM"] = "notifications@agentxindia.com"
        os.environ["EMAIL_FROM_NAME"] = "AGENTX INDIA 2026 Team"

        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"id": "resend_msg_id_990011"}
        mock_post.return_value = mock_resp

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
        self.assertEqual(res["http_status"], 200)
        self.assertEqual(res["resend_id"], "resend_msg_id_990011")

        mock_post.assert_called_once()
        call_kwargs = mock_post.call_args[1]
        self.assertEqual(call_kwargs["headers"]["Authorization"], "Bearer re_valid_api_key_123")
        self.assertEqual(call_kwargs["json"]["to"], ["sivaramakrishnabevaraa@gmail.com"])
        self.assertEqual(call_kwargs["json"]["from"], "AGENTX INDIA 2026 Team <notifications@agentxindia.com>")

    @patch("requests.post")
    def test_resend_transient_error_retry_success(self, mock_post):
        """Test Resend HTTP 500/503 retry logic (fails twice, succeeds on 3rd attempt)."""
        os.environ["RESEND_API_KEY"] = "re_valid_api_key_123"

        err_resp = MagicMock()
        err_resp.status_code = 503
        err_resp.text = "Service Unavailable"

        success_resp = MagicMock()
        success_resp.status_code = 200
        success_resp.json.return_value = {"id": "resend_msg_retry_ok"}

        mock_post.side_effect = [err_resp, err_resp, success_resp]

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
        self.assertEqual(res["resend_id"], "resend_msg_retry_ok")
        self.assertEqual(mock_post.call_count, 3)

    @patch("requests.post")
    def test_resend_independent_recipient_processing(self, mock_post):
        """
        Test independent delivery via Resend API:
        Member 1 fails persistent 500 error, Member 2 succeeds on attempt 1.
        """
        os.environ["RESEND_API_KEY"] = "re_valid_api_key_123"

        err_resp = MagicMock()
        err_resp.status_code = 500
        err_resp.text = "Internal Server Error"

        success_resp = MagicMock()
        success_resp.status_code = 200
        success_resp.json.return_value = {"id": "resend_msg_m2_ok"}

        # Member 1 fails 3 times, Member 2 succeeds on 1st try
        mock_post.side_effect = [err_resp, err_resp, err_resp, success_resp]

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

    @patch("requests.post")
    def test_duplicate_email_prevention(self, mock_post):
        """Test duplicate email prevention within team email dispatch."""
        os.environ["RESEND_API_KEY"] = "re_valid_api_key_123"

        success_resp = MagicMock()
        success_resp.status_code = 200
        success_resp.json.return_value = {"id": "resend_single"}
        mock_post.return_value = success_resp

        results = send_team_confirmation_emails(
            registration_id=1,
            team_id="AX2026-001",
            team_name="Cyber Sentinels",
            track_title="Agentic AI",
            member1_name="Sivaram",
            member1_email="sivaram54599@gmail.com",
            member2_name="Sivaram Copy",
            member2_email="sivaram54599@gmail.com",
            max_attempts=3,
            retry_delay=0.01
        )

        self.assertEqual(len(results), 1)
        self.assertIn("sivaram54599@gmail.com", results)
        self.assertTrue(results["sivaram54599@gmail.com"]["success"])
        self.assertEqual(mock_post.call_count, 1)

if __name__ == "__main__":
    unittest.main()
