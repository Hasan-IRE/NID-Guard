
import os
import base64

from dotenv import load_dotenv
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

load_dotenv()

AAD = b"NID_SECUREGUARD:v1"


def get_encryption_key():
    """Load and validate the AES-256 encryption key."""
    encoded_key = os.getenv("NID_ENCRYPTION_KEY")

    if not encoded_key:
        raise RuntimeError(
            "NID_ENCRYPTION_KEY is missing from .env"
        )

    try:
        key = base64.b64decode(encoded_key, validate=True)
    except Exception as exc:
        raise RuntimeError("Invalid encryption key format") from exc

    if len(key) != 32:
        raise RuntimeError(
            "AES-256 requires exactly 32 bytes (256 bits)"
        )

    return key


def encrypt_text(plain_text):
    """Encrypt text using AES-256-GCM."""
    if not isinstance(plain_text, str):
        raise TypeError("plain_text must be a string")

    key = get_encryption_key()
    aes = AESGCM(key)

    nonce = os.urandom(12)

    ciphertext = aes.encrypt(
        nonce,
        plain_text.encode("utf-8"),
        AAD
    )

    encrypted_data = nonce + ciphertext

    return "v1:" + base64.b64encode(
        encrypted_data
    ).decode("utf-8")


def decrypt_text(encrypted_text):
    """Decrypt AES-256-GCM encrypted text."""
    if not isinstance(encrypted_text, str):
        raise TypeError("encrypted_text must be a string")

    if not encrypted_text.startswith("v1:"):
        raise ValueError("Unsupported encryption version")

    key = get_encryption_key()
    aes = AESGCM(key)

    encrypted_data = base64.b64decode(
        encrypted_text[3:],
        validate=True
    )

    if len(encrypted_data) < 29:
        raise ValueError("Invalid encrypted data")

    nonce = encrypted_data[:12]
    ciphertext = encrypted_data[12:]

    decrypted_data = aes.decrypt(
        nonce,
        ciphertext,
        AAD
    )

    return decrypted_data.decode("utf-8")
