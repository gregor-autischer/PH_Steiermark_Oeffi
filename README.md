# Powerhaus - Steirische Öffis - Home Assistant Integration

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)

A Home Assistant custom integration for real-time public transit departure information for Public Transit in Styria, Austria (Steiermark, Österreich).

**Looking for the dashboard card?** Check out the [Powerhaus Steiermark Öffi Card](https://github.com/gregor-autischer/PH_Steiermark_Oeffi_Card) repository for a beautiful Lovelace card to display your transit departures.

## Features

- 🚌 Real-time departure information from TRIAS API
- ⏱️ Updates every minute
- 📊 Creates 7 sensor entities for next departures
- 🔔 Shows delays and scheduled vs real-time data
- 🔄 **Two monitoring modes:**
  - **Trip Planning Mode**: Monitor connections between two locations using coordinates
  - **Station Departures Mode**: Monitor all departures from a single station by name
- 🔍 Automatic station search with interactive selection

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

The integration supports two monitoring modes that you can choose during setup:

### Mode 1: Trip Planning (Origin → Destination)
Monitor transit connections between two specific locations using coordinates.

**Required configuration:**
- **TRIAS API URL**: The API endpoint URL
- **Origin Latitude/Longitude**: Your starting point coordinates
- **Destination Latitude/Longitude**: Your destination coordinates

**Use case**: Track the next 7 departures for your daily commute between specific locations.

### Mode 2: Station Departures (Single Station)
Monitor all departures from a specific station by name.

**Required configuration:**
- **TRIAS API URL**: The API endpoint URL
- **Station Name**: Name of the station (e.g., "Graz Hauptbahnhof")

The integration will automatically:
1. Search for matching stations via the TRIAS API
2. Present you with a list of found stations
3. Let you select the exact station you want to monitor

**Use case**: Monitor all departures from your local bus/tram stop or train station.

**Note**: You need to obtain the TRIAS API URL from the Styrian transit provider. How to obtain the API URL is described on this site: https://www.verbundlinie.at/de/kundenservice/weitere-infostellen/faqs-hilfe/faq-zur-ogd-service-schnittstelle-trias

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
