"""
License Router
=============
License API endpoints.
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException

from .validator import (
    get_license_validator,
    LicenseValidator,
    License,
    HardwareInfo,
)
from .activation import (
    get_activation_manager,
    LicenseActivationManager,
)


class ActivateRequest(BaseModel):
    """License activation request."""
    license_key: str
    hardware_info: Optional[Dict[str, Any]] = None


class DeactivateRequest(BaseModel):
    """License deactivation request."""
    license_key: Optional[str] = None


class HardwareInfoModel(BaseModel):
    """Hardware information model."""
    cpu_id: str = ""
    motherboard_id: str = ""
    mac_address: str = ""
    machine_uuid: str = ""
    os_identifier: str = ""
    hostname: str = ""
    fingerprint: str = ""


class LicenseResponse(BaseModel):
    """License response model."""
    id: str
    key: str
    edition: str
    status: str
    owner: Optional[str] = None
    organization: Optional[str] = None
    max_clients: int
    max_sessions: int
    features: list
    activated_at: Optional[str] = None
    expires_at: Optional[str] = None


class LicenseRouter:
    """
    License router.
    
    Provides endpoints for:
    - Get license info
    - Activate license
    - Deactivate license
    - Refresh license
    - Validate license
    """
    
    def __init__(
        self,
        validator: Optional[LicenseValidator] = None,
        activation_manager: Optional[LicenseActivationManager] = None
    ):
        self._validator = validator or get_license_validator()
        self._activation_manager = activation_manager or get_activation_manager()
        
    async def get_license(self, license_key: Optional[str] = None) -> Dict[str, Any]:
        """
        Get license information.
        
        GET /license
        """
        if license_key:
            license = self._validator.get_license(license_key)
            if not license:
                raise HTTPException(status_code=404, detail="License not found")
            return self._format_license(license)
            
        # Return first valid license
        licenses = self._validator.get_all_licenses()
        for license in licenses:
            if license.status.value == "valid":
                return self._format_license(license)
                
        return {
            "status": "not_found",
            "message": "No active license"
        }
        
    async def activate(
        self,
        request: ActivateRequest
    ) -> Dict[str, Any]:
        """
        Activate a license.
        
        POST /license/activate
        """
        # Create hardware info
        hw_info = None
        if request.hardware_info:
            hw_info = HardwareInfo(
                cpu_id=request.hardware_info.get("cpu_id", ""),
                motherboard_id=request.hardware_info.get("motherboard_id", ""),
                mac_address=request.hardware_info.get("mac_address", ""),
                machine_uuid=request.hardware_info.get("machine_uuid", ""),
                os_identifier=request.hardware_info.get("os_identifier", ""),
                hostname=request.hardware_info.get("hostname", ""),
                fingerprint=request.hardware_info.get("fingerprint", ""),
            )
            
        result = self._activation_manager.activate(
            request.license_key,
            hw_info or HardwareInfo(
                cpu_id="unknown",
                motherboard_id="unknown",
                mac_address="unknown",
                machine_uuid="unknown",
                os_identifier="unknown",
                hostname="unknown",
                fingerprint="unknown",
            )
        )
        
        if not result.success:
            return {
                "success": False,
                "error": result.error_code,
                "message": result.message
            }
            
        return {
            "success": True,
            "data": self._format_license(result.license),
            "message": result.message
        }
        
    async def deactivate(
        self,
        license_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Deactivate a license.
        
        POST /license/deactivate
        """
        if not license_key:
            # Deactivate all
            for license in self._validator.get_all_licenses():
                self._activation_manager.deactivate(license.key)
        else:
            result = self._activation_manager.deactivate(license_key)
            if not result.success:
                return {
                    "success": False,
                    "message": result.message
                }
                
        return {
            "success": True,
            "message": "License deactivated successfully"
        }
        
    async def refresh(
        self,
        license_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Refresh a license.
        
        POST /license/refresh
        """
        if not license_key:
            # Refresh first valid license
            for license in self._validator.get_all_licenses():
                if license.status.value == "valid":
                    license_key = license.key
                    break
                    
        if not license_key:
            raise HTTPException(status_code=404, detail="No license to refresh")
            
        result = self._activation_manager.refresh(license_key)
        
        if not result.success:
            return {
                "success": False,
                "message": result.message
            }
            
        return {
            "success": True,
            "data": self._format_license(result.license),
            "message": result.message
        }
        
    async def get_status(self) -> Dict[str, Any]:
        """
        Get license status.
        
        GET /license/status
        """
        licenses = self._validator.get_all_licenses()
        
        for license in licenses:
            if license.status.value == "valid":
                validation = self._validator.validate(license)
                return {
                    "valid": validation.valid,
                    "license": self._format_license(license),
                    "errors": validation.errors,
                    "warnings": validation.warnings,
                    "offline_cache_valid": validation.offline_cache_valid,
                    "offline_cache_expires": (
                        validation.offline_cache_expires.isoformat()
                        if validation.offline_cache_expires else None
                    )
                }
                
        return {
            "valid": False,
            "license": None,
            "errors": ["No active license"],
            "warnings": [],
            "offline_cache_valid": False
        }
        
    async def validate(
        self,
        license_data: Dict[str, Any],
        hardware_info: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Validate a license.
        
        POST /license/validate
        """
        license_key = license_data.get("key")
        
        if not license_key:
            raise HTTPException(status_code=400, detail="License key required")
            
        hw_info = None
        if hardware_info:
            hw_info = HardwareInfo(
                cpu_id=hardware_info.get("cpu_id", ""),
                motherboard_id=hardware_info.get("motherboard_id", ""),
                mac_address=hardware_info.get("mac_address", ""),
                machine_uuid=hardware_info.get("machine_uuid", ""),
                os_identifier=hardware_info.get("os_identifier", ""),
                hostname=hardware_info.get("hostname", ""),
                fingerprint=hardware_info.get("fingerprint", ""),
            )
            
        validation = self._activation_manager.validate(license_key, hw_info)
        
        return {
            "valid": validation.valid,
            "license": self._format_license(validation.license) if validation.license else None,
            "errors": validation.errors,
            "warnings": validation.warnings,
            "offline_cache_valid": validation.offline_cache_valid,
            "offline_cache_expires": (
                validation.offline_cache_expires.isoformat()
                if validation.offline_cache_expires else None
            )
        }
        
    def _format_license(self, license: License) -> Dict[str, Any]:
        """Format license for response."""
        return {
            "id": license.id,
            "key": license.key,
            "edition": license.edition.value,
            "status": license.status.value,
            "owner": license.owner,
            "organization": license.organization,
            "max_clients": license.max_clients,
            "max_sessions": license.max_sessions,
            "features": license.features,
            "activated_at": (
                license.activated_at.isoformat()
                if license.activated_at else None
            ),
            "expires_at": (
                license.expires_at.isoformat()
                if license.expires_at else None
            ),
        }


# Singleton router instance
_license_router: Optional[LicenseRouter] = None


def get_license_router() -> LicenseRouter:
    """Get the global license router."""
    global _license_router
    if _license_router is None:
        _license_router = LicenseRouter()
    return _license_router
