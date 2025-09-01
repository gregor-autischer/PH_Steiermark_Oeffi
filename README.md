# Powerhaus - Steirische Öffis - Home Assistant Integration

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)

A Home Assistant custom integration for real-time public transit departure information from Steirische Linien (Verbund Linie) in Styria, Austria.

## Features

- 🚌 Real-time departure information from TRIAS API
- ⏱️ Updates every minute
- 📊 Creates 7 sensor entities for next departures
- 🔔 Shows delays and scheduled vs real-time data
- 📍 Configurable origin and destination coordinates
- 🎨 Clean integration with Home Assistant UI

## Installation

### Option 1: HACS (Recommended)

1. Ensure [HACS](https://hacs.xyz/) is installed
2. Add this repository as a custom repository:
   - HACS → Integrations → Menu → Custom repositories
   - Repository: `https://github.com/gregor/PH_Steiermark_Oeffi`
   - Category: `Integration`
3. Click "Install"
4. Restart Home Assistant
5. Add integration via UI (Settings → Devices & Services → Add Integration → Search "Powerhaus - Steirische Öffis")

### Option 2: Manual Installation

1. Copy the `custom_components/steirische_linien` folder to your Home Assistant `config/custom_components/` directory
2. Restart Home Assistant
3. Add integration via UI

## Configuration

Configure through the UI with:
- **TRIAS API URL**: The API endpoint URL (contact your transit provider)
- **Origin Latitude/Longitude**: Your starting point
- **Destination Latitude/Longitude**: Your destination

Default coordinates:
- Origin: HBG (47.061130, 15.466008)
- Destination: LKH Graz Auenbrugger Platz 15 (47.081397, 15.464796)

**Note**: You need to obtain the TRIAS API URL from your local transit provider.

## Sensors

The integration creates 7 sensors (`sensor.transit_departure_1` through `sensor.transit_departure_7`) with:

### State
- Minutes until departure
- `*` suffix: Scheduled time (no real-time data)
- `!` suffix: Delayed

### Attributes
- `line`: Transit line number
- `destination`: Direction/destination
- `departure_time`: Time in HH:MM format
- `is_delayed`: Boolean for delay status
- `is_scheduled`: Boolean for data type

## Example Lovelace Card

```yaml
type: entities
title: Next Departures
entities:
  - entity: sensor.transit_departure_1
    name: Next Bus
  - entity: sensor.transit_departure_2
    name: 2nd Departure
  - entity: sensor.transit_departure_3
    name: 3rd Departure
```

## Development

### Testing with Docker

```bash
docker-compose up -d
```
Access at http://localhost:8222

### Project Structure
```
custom_components/steirische_linien/
├── __init__.py
├── manifest.json
├── config_flow.py
├── sensor.py
└── translations/
    └── en.json
```

## Credits

Uses the TRIAS API from Verbund Linie

## License

Apache License 2.0 - see the [LICENSE](LICENSE) file for details.