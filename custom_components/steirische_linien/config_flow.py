"""Config flow for Steirische Linien integration."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResult
from homeassistant.exceptions import HomeAssistantError

from . import DOMAIN

_LOGGER = logging.getLogger(__name__)

STEP_USER_DATA_SCHEMA = vol.Schema(
    {
        vol.Required("api_url"): str,
        vol.Required("origin_latitude"): float,
        vol.Required("origin_longitude"): float,
        vol.Required("destination_latitude"): float,
        vol.Required("destination_longitude"): float,
    }
)


async def validate_input(hass: HomeAssistant, data: dict[str, Any]) -> dict[str, Any]:
    """Validate the user input allows us to connect."""
    # Validate URL format
    if not data["api_url"].startswith(("http://", "https://")):
        raise ValueError("Invalid API URL format")
    
    # Validate coordinates are within reasonable bounds
    if not -90 <= data["origin_latitude"] <= 90:
        raise ValueError("Invalid origin latitude")
    if not -180 <= data["origin_longitude"] <= 180:
        raise ValueError("Invalid origin longitude")
    if not -90 <= data["destination_latitude"] <= 90:
        raise ValueError("Invalid destination latitude")
    if not -180 <= data["destination_longitude"] <= 180:
        raise ValueError("Invalid destination longitude")

    return {"title": "Powerhaus - Steirische Öffis"}


class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Steirische Linien."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        errors: dict[str, str] = {}
        if user_input is not None:
            try:
                info = await validate_input(self.hass, user_input)
            except ValueError:
                errors["base"] = "invalid_coordinates"
            except Exception:  # pylint: disable=broad-except
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "unknown"
            else:
                return self.async_create_entry(title=info["title"], data=user_input)

        return self.async_show_form(
            step_id="user", data_schema=STEP_USER_DATA_SCHEMA, errors=errors
        )