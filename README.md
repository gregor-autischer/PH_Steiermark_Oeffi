# Powerhaus - Steirische Öffis - Home Assistant Integration

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)

A Home Assistant custom integration for real-time public transit departure information for Public Transit in Styria, Austria (Steiermark, Österreich).

**Looking for the dashboard card?** Check out the [Powerhaus Steiermark Öffi Card](https://github.com/gregor-autischer/PH_Steiermark_Oeffi_Card) repository for a beautiful Lovelace card to display your transit departures.

## Features

- 🚌 Real-time departure information from TRIAS API
- ⏱️ Updates every minute
- 📊 Creates 7 sensor entities for next departures
- 🔔 Shows delays and scheduled vs real-time data
- 📍 Configurable origin and destination coordinates

## Installation

A installation tutorial is available on YouTube (Video in German!): https://youtu.be/SNTVm_d8RSk

### Option 1: HACS (Recommended)

1. Ensure [HACS](https://hacs.xyz/) is installed
2. Add this repository as a custom repository:
   - HACS → Integrations → Menu → Custom repositories
   - Repository: `https://github.com/gregor-autischer/PH_Steiermark_Oeffi`
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
- **TRIAS API URL**: The API endpoint URL (contact the transit provider)
- **Origin Latitude/Longitude**: Your starting point coordinates
- **Destination Latitude/Longitude**: Your destination coordinates

**Note**: You need to obtain the TRIAS API URL from the styrian transit provider and determine your specific route coordinates. How to obtain the API URL is described on this site: https://www.verbundlinie.at/de/kundenservice/weitere-infostellen/faqs-hilfe/faq-zur-ogd-service-schnittstelle-trias

## Sensors

The integration creates 7 sensors (`sensor.transit_departure_1` through `sensor.transit_departure_7`) with:

### State
- Minutes until departure

### Attributes
- `line`: Transit line number
- `destination`: Direction/destination
- `departure_time`: Time in HH:MM format
- `is_delayed`: Boolean for delay status
- `is_scheduled`: Boolean for data type if only scheduled info and no live data is available
- `scheduled_departure_time`: Scheduled departure time in HH:MM format
- `live_departure_time`: Live/real-time departure in HH:MM format (if available)

## License

Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
