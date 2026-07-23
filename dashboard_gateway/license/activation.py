"""
License Activation
=================
License activation and management.
"""

from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from dataclasses import dataclass
import hashlib

from .validator import (
    LicenseValidator,
    License,
    LicenseEdition,
    LicenseStatus,
    HardwareInfo,
    ValidationResult,
    get_license_validator,
)


@dataclass
class ActivationResult:
    """License activation result."""
    success: bool
    license: Optional[License] = None
    message: str = ""
    error_code: Optional[str] = None


@dataclass 
class DeactivationResult:
    """License deactivation result."""
    success: bool
    message: str = ""


class LicenseActivationManager:
    """
    License activation manager.
    
    Handles:
    - License activation
    - License deactivation
    - License refresh
    - Offline validation cache
    """
    
    def __init__(self, validator: Optional[LicenseValidator] = None):
        self._validator = validator or get_license_validator()
        
        # Offline validation cache
        self._offline_cache: Dict[str, Dict[str, Any]] = {}
        self._cache_expiry_hours = 24
        
    def activate(
        self,
        license_key: str,
        hardware: HardwareInfo
    ) -> ActivationResult:
        """
        Activate a license.
        
        Args:
            license_key: License key
            hardware: Hardware info for binding
            
        Returns:
            ActivationResult with activation status
        """
        # Find license
        license = self._validator.get_license(license_key)
        
        if not license:
            return ActivationResult(
                success=False,
                message="License key not found",
                error_code="LICENSE_NOT_FOUND"
            )
            
        # Check if already activated on different hardware
        if license.device_id and license.device_id != hardware.fingerprint:
            # Check if it's the same device
            if license.activation_count >= license.max_activations:
                return ActivationResult(
                    success=False,
                    message="License has been activated on maximum number of devices",
                    error_code="MAX_ACTIVATIONS"
                )
                
        # Check if revoked
        if license.status == LicenseStatus.REVOKED:
            return ActivationResult(
                success=False,
                message="License has been revoked",
                error_code="LICENSE_REVOKED"
            )
            
        # Activate
        license.status = LicenseStatus.VALID
        license.activated_at = datetime.utcnow()
        license.device_id = hardware.fingerprint
        license.hardware_id = self._generate_hardware_id(hardware)
        license.activation_count += 1
        
        # Store offline cache
        self._store_offline_cache(license)
        
        return ActivationResult(
            success=True,
            license=license,
            message="License activated successfully"
        )
        
    def deactivate(
        self,
        license_key: str
    ) -> DeactivationResult:
        """
        Deactivate a license.
        
        Args:
            license_key: License key
            
        Returns:
            DeactivationResult with deactivation status
        """
        license = self._validator.get_license(license_key)
        
        if not license:
            return DeactivationResult(
                success=False,
                message="License not found"
            )
            
        # Deactivate
        license.status = LicenseStatus.PENDING
        license.device_id = None
        license.hardware_id = None
        license.activated_at = None
        
        # Clear offline cache
        self._clear_offline_cache(license_key)
        
        return DeactivationResult(
            success=True,
            message="License deactivated successfully"
        )
        
    def refresh(
        self,
        license_key: str
    ) -> ActivationResult:
        """
        Refresh a license.
        
        Args:
            license_key: License key
            
        Returns:
            ActivationResult with refresh status
        """
        license = self._validator.get_license(license_key)
        
        if not license:
            return ActivationResult(
                success=False,
                message="License not found",
                error_code="LICENSE_NOT_FOUND"
            )
            
        # Re-validate
        validation = self._validator.validate(license)
        
        if not validation.valid:
            return ActivationResult(
                success=False,
                license=license,
                message="; ".join(validation.errors),
                error_code="VALIDATION_FAILED"
            )
            
        # Update cache
        self._store_offline_cache(license)
        
        return ActivationResult(
            success=True,
            license=license,
            message="License refreshed successfully"
        )
        
    def validate(
        self,
        license_key: str,
        hardware: Optional[HardwareInfo] = None
    ) -> ValidationResult:
        """
        Validate a license.
        
        Args:
            license_key: License key
            hardware: Hardware info for binding
            
        Returns:
            ValidationResult with validation status
        """
        license = self._validator.get_license(license_key)
        
        if not license:
            return ValidationResult(
                valid=False,
                errors=["License not found"]
            )
            
        # Try online validation first
        try:
            validation = self._validator.validate(license, hardware)
            
            if validation.valid:
                self._store_offline_cache(license)
                
            return validation
        except:
            # Fall back to offline cache
            return self._get_offline_validation(license_key)
            
    def _generate_hardware_id(self, hardware: HardwareInfo) -> str:
        """Generate hardware ID from hardware info."""
        data = f"{hardware.cpu_id}|{hardware.motherboard_id}|{hardware.machine_uuid}"
        return hashlib.sha256(data.encode()).hexdigest()[:16]
        
    def _store_offline_cache(self, license: License) -> None:
        """Store validation result for offline use."""
        cache_key = license.key
        
        self._offline_cache[cache_key] = {
            "license": {
                "id": license.id,
                "key": license.key,
                "edition": license.edition.value,
                "status": license.status.value,
                "owner": license.owner,
                "organization": license.organization,
                "features": license.features,
                "expires_at": license.expires_at.isoformat() if license.expires_at else None,
            },
            "stored_at": datetime.utcnow().isoformat(),
            "expires_at": (
                datetime.utcnow() + timedelta(hours=self._cache_expiry_hours)
            ).isoformat(),
        }
        
    def _get_offline_validation(self, license_key: str) -> ValidationResult:
        """Get validation from offline cache."""
        cache = self._offline_cache.get(license_key)
        
        if not cache:
            return ValidationResult(
                valid=False,
                errors=["No offline cache available"]
            )
            
        # Check if cache is expired
        expires_at = datetime.fromisoformat(cache["expires_at"])
        if datetime.utcnow() > expires_at:
            return ValidationResult(
                valid=False,
                errors=["Offline cache expired"]
            )
            
        # Return cached validation
        return ValidationResult(
            valid=True,
            license=License(
                id=cache["license"]["id"],
                key=cache["license"]["key"],
                edition=LicenseEdition(cache["license"]["edition"]),
                status=LicenseStatus.VALID,
                owner=cache["license"].get("owner"),
                organization=cache["license"].get("organization"),
                features=cache["license"]["features"],
                expires_at=(
                    datetime.fromisoformat(cache["license"]["expires_at"])
                    if cache["license"].get("expires_at") else None
                ),
            ),
            offline_cache_valid=True,
            offline_cache_expires=expires_at,
            warnings=["Using offline cache - may not reflect recent changes"]
        )
        
    def _clear_offline_cache(self, license_key: str) -> None:
        """Clear offline cache for a license."""
        self._offline_cache.pop(license_key, None)


# Global activation manager instance
_activation_manager: Optional[LicenseActivationManager] = None


def get_activation_manager() -> LicenseActivationManager:
    """Get the global activation manager."""
    global _activation_manager
    if _activation_manager is None:
        _activation_manager = LicenseActivationManager()
    return _activation_manager
