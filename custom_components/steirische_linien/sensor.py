"""Sensor platform for Steirische Linien."""
from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Any
from xml.etree import ElementTree as ET

import aiohttp
import async_timeout

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import (
    CoordinatorEntity,
    DataUpdateCoordinator,
    UpdateFailed,
)

_LOGGER = logging.getLogger(__name__)

SCAN_INTERVAL = timedelta(minutes=1)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the sensor platform."""
    coordinator = SteirischeLinienDataUpdateCoordinator(
        hass,
        config_entry.data,
    )

    await coordinator.async_config_entry_first_refresh()

    sensors = []
    for i in range(7):
        sensors.append(
            TransitDepartureSensor(
                coordinator,
                i,
                config_entry.entry_id,
            )
        )

    async_add_entities(sensors)


class SteirischeLinienDataUpdateCoordinator(DataUpdateCoordinator):
    """Class to manage fetching data from the API."""

    def __init__(
        self,
        hass: HomeAssistant,
        config_data: dict,
    ) -> None:
        """Initialize."""
        self.config_data = config_data
        self.hass = hass
        super().__init__(
            hass,
            _LOGGER,
            name="Powerhaus - Steirische Öffis",
            update_interval=SCAN_INTERVAL,
        )

    async def _async_update_data(self):
        """Update data via library."""
        try:
            async with async_timeout.timeout(30):
                return await self._fetch_departures()
        except Exception as err:
            raise UpdateFailed(f"Error communicating with API: {err}")

    async def _fetch_departures(self):
        """Fetch departure data from TRIAS API."""
        api_url = self.config_data.get("api_url")
        origin_lat = self.config_data.get("origin_latitude")
        origin_lon = self.config_data.get("origin_longitude")
        dest_lat = self.config_data.get("destination_latitude")
        dest_lon = self.config_data.get("destination_longitude")
        
        xml_request = self._create_trip_request_xml(
            origin_lat, origin_lon,
            dest_lat, dest_lon,
            datetime.now()
        )

        headers = {
            "User-Agent": "HomeAssistant",
            "Content-Type": "text/xml",
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(
                api_url,
                data=xml_request.encode('utf-8'),
                headers=headers
            ) as response:
                response_text = await response.text()
                return self._parse_departures(response_text)

    def _create_trip_request_xml(
        self,
        origin_lat: float,
        origin_lon: float,
        dest_lat: float,
        dest_lon: float,
        dep_time: datetime,
    ) -> str:
        """Create TRIAS XML request for trip planning."""
        utc_time = dep_time - timedelta(hours=2)
        dep_arr_time = utc_time.strftime("%Y-%m-%dT%H:%M:%SZ")
        
        now_utc = datetime.now() - timedelta(hours=2)
        request_timestamp = now_utc.strftime("%Y-%m-%dT%H:%M:%SZ")
        
        return f"""<Trias xmlns="http://www.vdv.de/trias" xmlns:siri="http://www.siri.org.uk/siri" version="1.2">
<ServiceRequest>
<siri:RequestTimestamp>{request_timestamp}</siri:RequestTimestamp>
<siri:RequestorRef>homeassistant</siri:RequestorRef>
<RequestPayload>
<TripRequest>
<Origin>
<LocationRef>
<GeoPosition>
<Longitude>{origin_lon}</Longitude>
<Latitude>{origin_lat}</Latitude>
</GeoPosition>
<LocationName>
<Text>Origin</Text>
<Language>de</Language>
</LocationName>
</LocationRef>
<DepArrTime>{dep_arr_time}</DepArrTime>
</Origin>
<Destination>
<LocationRef>
<GeoPosition>
<Longitude>{dest_lon}</Longitude>
<Latitude>{dest_lat}</Latitude>
</GeoPosition>
<LocationName>
<Text>Destination</Text>
<Language>de</Language>
</LocationName>
</LocationRef>
</Destination>
<Params>
<NumberOfResults>10</NumberOfResults>
<IncludeTrackSections>false</IncludeTrackSections>
<IncludeLegProjection>false</IncludeLegProjection>
<IncludeIntermediateStops>true</IncludeIntermediateStops>
<IncludeAllRestrictedLines>false</IncludeAllRestrictedLines>
<WalkSpeed>normal</WalkSpeed>
<OptimisationMethod>fastest</OptimisationMethod>
</Params>
</TripRequest>
</RequestPayload>
</ServiceRequest>
</Trias>"""

    def _parse_departures(self, xml_text: str) -> list[dict]:
        """Parse departures from TRIAS response."""
        departures = []
        
        try:
            namespaces = {
                'trias': 'http://www.vdv.de/trias',
                'siri': 'http://www.siri.org.uk/siri'
            }
            
            root = ET.fromstring(xml_text)
            trip_results = root.findall('.//trias:TripResult', namespaces)
            
            now = datetime.now()
            
            for trip_result in trip_results:
                first_timed_leg = trip_result.find('.//trias:TimedLeg', namespaces)
                
                if first_timed_leg is not None:
                    departure_info = {}
                    
                    # Get line number
                    line_name = first_timed_leg.find('.//trias:PublishedLineName/trias:Text', namespaces)
                    if line_name is not None:
                        departure_info['line'] = line_name.text
                    
                    # Get destination
                    destination = first_timed_leg.find('.//trias:DestinationText/trias:Text', namespaces)
                    if destination is not None:
                        departure_info['destination'] = destination.text
                    
                    # Get times
                    board_estimated = first_timed_leg.find('.//trias:LegBoard//trias:EstimatedTime', namespaces)
                    board_scheduled = first_timed_leg.find('.//trias:LegBoard//trias:TimetabledTime', namespaces)
                    
                    departure_time_str = None
                    is_delayed = False
                    is_scheduled = False
                    
                    if board_estimated is not None:
                        departure_time_str = board_estimated.text
                        if board_scheduled is not None:
                            try:
                                sched_utc = datetime.strptime(board_scheduled.text, "%Y-%m-%dT%H:%M:%SZ")
                                est_utc = datetime.strptime(board_estimated.text, "%Y-%m-%dT%H:%M:%SZ")
                                if est_utc > sched_utc:
                                    is_delayed = True
                            except:
                                pass
                    elif board_scheduled is not None:
                        departure_time_str = board_scheduled.text
                        is_scheduled = True
                    
                    if departure_time_str:
                        try:
                            dep_utc = datetime.strptime(departure_time_str, "%Y-%m-%dT%H:%M:%SZ")
                            dep_local = dep_utc + timedelta(hours=2)
                            
                            if dep_local >= now:
                                minutes_until = int((dep_local - now).total_seconds() / 60)
                                departure_info['minutes'] = minutes_until
                                departure_info['time'] = dep_local.strftime("%H:%M")
                                departure_info['is_delayed'] = is_delayed
                                departure_info['is_scheduled'] = is_scheduled
                                departures.append(departure_info)
                        except:
                            pass
            
            # Sort by minutes
            departures.sort(key=lambda x: x.get('minutes', 999))
            
            # Filter out duplicates based on line, destination, and time
            seen = set()
            unique_departures = []
            for dep in departures:
                # Create a unique key from line, destination, and departure time
                key = (
                    dep.get('line', ''),
                    dep.get('destination', ''),
                    dep.get('time', '')
                )
                if key not in seen:
                    seen.add(key)
                    unique_departures.append(dep)
                    if len(unique_departures) >= 7:
                        break
            
            return unique_departures
            
        except Exception as e:
            _LOGGER.error(f"Error parsing response: {e}")
            return []


class TransitDepartureSensor(CoordinatorEntity, SensorEntity):
    """Representation of a Transit Departure sensor."""

    def __init__(
        self,
        coordinator: SteirischeLinienDataUpdateCoordinator,
        index: int,
        entry_id: str,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._index = index
        self._attr_unique_id = f"{entry_id}_departure_{index + 1}"
        self._attr_name = f"Transit Departure {index + 1}"

    @property
    def state(self) -> str | None:
        """Return the state of the sensor."""
        if self.coordinator.data and len(self.coordinator.data) > self._index:
            departure = self.coordinator.data[self._index]
            minutes = departure.get('minutes', 0)
            return str(minutes)
        return None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the state attributes."""
        if self.coordinator.data and len(self.coordinator.data) > self._index:
            departure = self.coordinator.data[self._index]
            return {
                "line": departure.get('line', 'Unknown'),
                "destination": departure.get('destination', 'Unknown'),
                "departure_time": departure.get('time', ''),
                "is_delayed": departure.get('is_delayed', False),
                "is_scheduled": departure.get('is_scheduled', False),
            }
        return {}

    @property
    def icon(self) -> str:
        """Return the icon to use in the frontend."""
        return "mdi:bus"