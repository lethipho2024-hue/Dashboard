"""
License Validator
================
License validation and verification.
"""

from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from enum import Enum
import hashlib
import secrets


class LicenseEdition(str, Enum):
    """License edition types."""
    TRIAL = "trial"
    DEVELOPER = "developer"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"
    UNLIMITED = "unlimited"


class LicenseStatus(str, Enum):
    """License status."""
    VALID = "valid"
    EXPIRED = "expired"
    REVOKED = "revoked"
    INVALID = "invalid"
    NOT_FOUND = "not_found"
    PENDING = "pending"


@dataclass
class License:
    """License model."""
    id: str
    key: str
    edition: LicenseEdition
    status: LicenseStatus
    owner: Optional[str] = None
    organization: Optional[str] = None
    max_clients: int = 1
    max_sessions: int = 1
    features: List[str] = field(default_factory=list)
    activated_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    device_id: Optional[str] = None
    hardware_id: Optional[str] = None
    signature: Optional[str] = None
    activation_count: int = 0
    max_activations: int = 1
    created_at: datetime = field(default_factory=datetime.utcnow)


@dataclass
class HardwareInfo:
    """Hardware information for license binding."""
    cpu_id: str
    motherboard_id: str
    mac_address: str
    machine_uuid: str
    os_identifier: str
    hostname: str
    fingerprint: str


@dataclass
class ValidationResult:
    """License validation result."""
    valid: bool
    license: Optional[License] = None
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    offline_cache_valid: bool = False
    offline_cache_expires: Optional[datetime] = None


class LicenseValidator:
    """
    License validator.
    
    Validates:
    - License signature
    - Expiration date
    - Hardware binding
    - Edition features
    - Activation count
    """
    
    def __init__(self):
        # In-memory license storage (replace with database in production)
        self._licenses: Dict[str, License] = {}
        self._revoked_keys: set = set()
        
        # Create a demo license
        self._create_demo_license()
        
    def _create_demo_license(self) -> None:
        """Create a demo license for testing."""
        demo = License(
            id="license-demo",
            key="DEMO-PRO-12345-67890-ABCDE",
            edition=LicenseEdition.PROFESSIONAL,
            status=LicenseStatus.VALID,
            owner="Demo User",
            organization="ZBGym Demo",
            max_clients=5,
            max_sessions=10,
            features=[
                "kernel_control",
                "training_management",
                "replay",
                "metrics",
                "plugins",
                "ai_assistant",
            ],
            expires_at=datetime.utcnow() + timedelta(days=365),
            device_id="demo-device",
            max_activations=3,
        )
        self._licenses["license-demo"] = demo
        
    def _generate_signature(self, license_data: Dict[str, Any]) -> str:
        """Generate a license signature (simplified for demo)."""
        data_str = "|".join(f"{k}={v}" for k, v in sorted(license_data.items()))
        return hashlib.sha256(data_str.encode()).hexdigest()[:32]
        
    def validate_signature(self, license_key: str, signature: str) -> bool:
        """Validate license signature."""
        # In production, this would use cryptographic verification
        return True
        
    def validate_hardware(self, license: License, hardware: HardwareInfo) -> bool:
        """Validate hardware binding."""
        if not license.device_id:
            return True  # No hardware binding
            
        # In production, this would do proper hardware verification
        return True
        
    def validate_expiration(self, license: License) -> bool:
        """Validate license expiration."""
        if not license.expires_at:
            return True  # No expiration
            
        return datetime.utcnow() < license.expires_at
        
    def validate_activations(self, license: License) -> bool:
        """Validate activation count."""
        return license.activation_count < license.max_activations
        
    def validate(
        self,
        license: License,
        hardware: Optional[HardwareInfo] = None
    ) -> ValidationResult:
        """
        Validate a license.
        
        Args:
            license: License to validate
            hardware: Hardware info for binding check
            
        Returns:
            ValidationResult with validation status
        """
        errors: List[str] = []
        warnings: List[str] = []
        
        # Check status
        if license.status == LicenseStatus.REVOKED:
            errors.append("License has been revoked")
            return ValidationResult(valid=False, license=license, errors=errors)
            
        if license.status == LicenseStatus.INVALID:
            errors.append("License is invalid")
            return ValidationResult(valid=False, license=license, errors=errors)
            
        if license.status == LicenseStatus.NOT_FOUND:
            errors.append("License not found")
            return ValidationResult(valid=False, license=license, errors=errors)
            
        # Check expiration
        if not self.validate_expiration(license):
            errors.append("License has expired")
            return ValidationResult(
                valid=False,
                license=license,
                errors=errors,
                warnings=["License expired"]
            )
            
        # Check hardware binding
        if hardware and not self.validate_hardware(license, hardware):
            errors.append("Hardware binding mismatch")
            return ValidationResult(valid=False, license=license, errors=errors)
            
        # Check activations
        if not self.validate_activations(license):
            warnings.append("Maximum activations reached")
            
        # Check expiration warning
        if license.expires_at:
            days_until_expiry = (license.expires_at - datetime.utcnow()).days
            if days_until_expiry <= 7:
                warnings.append(f"License expires in {days_until_expiry} days")
            elif days_until_expiry <= 30:
                warnings.append(f"License expires in {days_until_expiry} days")
                
        return ValidationResult(
            valid=True,
            license=license,
            errors=errors,
            warnings=warnings
        )
        
    def get_license(self, license_key: str) -> Optional[License]:
        """Get a license by key."""
        for license in self._licenses.values():
            if license.key == license_key:
                return license
        return None
        
    def get_all_licenses(self) -> List[License]:
        """Get all licenses."""
        return list(self._licenses.values())
        
    def get_stats(self) -> Dict[str, Any]:
        """Get license statistics."""
        return {
            "total_licenses": len(self._licenses),
            "valid_licenses": sum(
                1 for l in self._licenses.values()
                if l.status == LicenseStatus.VALID
            ),
            "expired_licenses": sum(
                1 for l in self._licenses.values()
                if l.status == LicenseStatus.EXPIRED
            ),
        }


# Global validator instance
_license_validator: Optional[LicenseValidator] = None


def get_license_validator() -> LicenseValidator:
    """Get the global license validator."""
    global _license_validator
    if _license_validator is None:
        _license_validator = LicenseValidator()
    return _license_validator
