"""
License Validator
================
License validation for Dashboard Gateway.
Supports Trial, Developer, Professional, and Enterprise licenses.
"""

import hashlib
import hmac
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from dataclasses import dataclass, field
from enum import Enum

from .config import LicenseType
from .logger import get_logger


@dataclass
class LicenseInfo:
    """License information."""
    license_type: LicenseType
    license_key: str
    valid: bool
    expires_at: Optional[datetime] = None
    features: Dict[str, bool] = field(default_factory=dict)
    max_clients: int = 1
    max_sessions: int = 1
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def is_expired(self) -> bool:
        """Check if license is expired."""
        if self.expires_at is None:
            return False
        return datetime.utcnow() > self.expires_at
    
    def has_feature(self, feature: str) -> bool:
        """Check if license has a feature."""
        return self.features.get(feature, False)


class LicenseValidator:
    """Validates and manages licenses."""
    
    # Default features per license type
    FEATURES = {
        LicenseType.TRIAL: {
            "websocket": True,
            "rest_api": True,
            "metrics": True,
            "events": True,
            "multi_client": False,
            "advanced_metrics": False,
            "custom_plugins": False,
            "priority_support": False,
        },
        LicenseType.DEVELOPER: {
            "websocket": True,
            "rest_api": True,
            "metrics": True,
            "events": True,
            "multi_client": True,
            "advanced_metrics": True,
            "custom_plugins": False,
            "priority_support": False,
        },
        LicenseType.PROFESSIONAL: {
            "websocket": True,
            "rest_api": True,
            "metrics": True,
            "events": True,
            "multi_client": True,
            "advanced_metrics": True,
            "custom_plugins": True,
            "priority_support": True,
        },
        LicenseType.ENTERPRISE: {
            "websocket": True,
            "rest_api": True,
            "metrics": True,
            "events": True,
            "multi_client": True,
            "advanced_metrics": True,
            "custom_plugins": True,
            "priority_support": True,
            "custom_branding": True,
            "sla_guarantee": True,
        },
    }
    
    # Max limits per license type
    MAX_CLIENTS = {
        LicenseType.TRIAL: 1,
        LicenseType.DEVELOPER: 3,
        LicenseType.PROFESSIONAL: 10,
        LicenseType.ENTERPRISE: 100,
    }
    
    MAX_SESSIONS = {
        LicenseType.TRIAL: 1,
        LicenseType.DEVELOPER: 5,
        LicenseType.PROFESSIONAL: 50,
        LicenseType.ENTERPRISE: 500,
    }
    
    def __init__(self, config):
        self.config = config
        self.logger = get_logger("license")
        self._current_license: Optional[LicenseInfo] = None
    
    def validate_key(self, license_key: str) -> bool:
        """Validate a license key format."""
        if not license_key:
            return False
        
        # Basic format check (key should be alphanumeric with dashes)
        if not all(c.isalnum() or c in '-_' for c in license_key):
            return False
        
        # Check length (keys should be between 20-50 characters)
        if len(license_key) < 20 or len(license_key) > 50:
            return False
        
        return True
    
    def decode_license(self, license_key: str) -> Optional[LicenseInfo]:
        """
        Decode and validate a license key.
        In production, this would verify cryptographic signatures.
        """
        if not self.validate_key(license_key):
            return None
        
        # Extract license type from key prefix
        key_prefix = license_key.split('-')[0].upper()
        
        try:
            license_type = LicenseType(key_prefix.lower())
        except ValueError:
            # Default to trial if unknown prefix
            license_type = LicenseType.TRIAL
        
        # In production, verify HMAC signature here
        # For now, create a basic license info
        
        return LicenseInfo(
            license_type=license_type,
            license_key=license_key,
            valid=True,
            expires_at=self._calculate_expiry(license_type),
            features=self.FEATURES.get(license_type, {}),
            max_clients=self.MAX_CLIENTS.get(license_type, 1),
            max_sessions=self.MAX_SESSIONS.get(license_type, 1),
            metadata={
                "issued_at": datetime.utcnow().isoformat(),
                "key_hash": hashlib.sha256(license_key.encode()).hexdigest()[:16],
            }
        )
    
    def _calculate_expiry(self, license_type: LicenseType) -> Optional[datetime]:
        """Calculate license expiry date."""
        if license_type == LicenseType.TRIAL:
            return datetime.utcnow() + timedelta(days=14)
        elif license_type == LicenseType.DEVELOPER:
            return datetime.utcnow() + timedelta(days=365)
        # Professional and Enterprise don't expire
        return None
    
    def activate(self, license_key: str) -> LicenseInfo:
        """Activate a license."""
        self.logger.info(f"Activating license: {license_key[:8]}...")
        
        license_info = self.decode_license(license_key)
        
        if license_info is None:
            self.logger.error(f"Invalid license key: {license_key[:8]}...")
            raise ValueError("Invalid license key")
        
        if license_info.is_expired():
            self.logger.error(f"License expired: {license_key[:8]}...")
            raise ValueError("License has expired")
        
        self._current_license = license_info
        self.logger.info(f"License activated: {license_info.license_type.value}")
        
        return license_info
    
    def validate(self) -> bool:
        """Validate current license."""
        if self._current_license is None:
            return False
        
        if self._current_license.is_expired():
            self.logger.warning("License expired")
            return False
        
        return self._current_license.valid
    
    def get_current_license(self) -> Optional[LicenseInfo]:
        """Get current license info."""
        return self._current_license
    
    def get_default_license(self) -> LicenseInfo:
        """Get default license based on config."""
        license_type = self.config.license_type
        
        return LicenseInfo(
            license_type=license_type,
            license_key="default",
            valid=True,
            expires_at=self._calculate_expiry(license_type),
            features=self.FEATURES.get(license_type, {}),
            max_clients=self.MAX_CLIENTS.get(license_type, 1),
            max_sessions=self.MAX_SESSIONS.get(license_type, 1),
        )
    
    def check_limit(self, limit_type: str, current: int) -> bool:
        """Check if a limit is reached."""
        license_info = self._current_license or self.get_default_license()
        
        if limit_type == "clients":
            return current < license_info.max_clients
        elif limit_type == "sessions":
            return current < license_info.max_sessions
        
        return True
