"""
Dashboard Gateway License
========================
License management module.
"""

from .validator import (
    LicenseValidator,
    License,
    LicenseEdition,
    LicenseStatus,
    HardwareInfo,
    ValidationResult,
    get_license_validator,
)
from .activation import (
    LicenseActivationManager,
    ActivationResult,
    DeactivationResult,
    get_activation_manager,
)
from .router import (
    LicenseRouter,
    get_license_router,
)


__all__ = [
    # Validator
    "LicenseValidator",
    "License",
    "LicenseEdition",
    "LicenseStatus",
    "HardwareInfo",
    "ValidationResult",
    "get_license_validator",
    
    # Activation
    "LicenseActivationManager",
    "ActivationResult",
    "DeactivationResult",
    "get_activation_manager",
    
    # Router
    "LicenseRouter",
    "get_license_router",
]
