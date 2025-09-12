# Powerhaus - Steirische Öffis - Home Assistant Integration

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)

A Home Assistant custom integration for real-time public transit departure information for Public Transit in Styria, Austria (Steiermark, Österreich).

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

## Custom Dashboard Card

This integration includes a custom Lovelace card for a beautiful display of transit departures.

### Installation

The integration installs automatically via HACS, but the card requires one additional step:

1. **Install the integration** via HACS (as described above)
2. **Add the card file manually:**
   - Download `www/steirische-linien-card.js` from the [GitHub repository](https://github.com/gregor-autischer/PH_Steiermark_Oeffi)
   - Copy it to your Home Assistant `config/www/` directory
3. **Add the resource:**
   - Settings → Dashboards → Resources → Add Resource
   - URL: `/local/steirische-linien-card.js`
   - Type: JavaScript Module
4. **Restart Home Assistant**
5. **Add the card:**
   - Edit Dashboard → Add Card → Search "PH Steiermark"
   - Or Add Card → Manual (use configuration below)

### Card Configuration

The card can be easily configured through Home Assistant's visual editor:

1. **Add the card** to your dashboard (Edit Dashboard → Add Card → search "PH Steiermark")
2. **Click the edit/configure button** on the card
3. **Configure the following options:**
   - **Number of departures**: Choose how many departures to display (1-7, default: 7)
   - **Line colors**: Add custom colors for specific transit lines:
     - Enter line number (e.g., "64")
     - Choose color using the color picker
     - Add multiple line colors as needed
     - Remove unwanted colors with the × button

#### Alternative: YAML Configuration

If you prefer to configure via YAML:

**Basic Configuration:**
```yaml
type: custom:steirische-linien-card
```

**Advanced Configuration:**
```yaml
type: custom:steirische-linien-card
departure_count: 5  # Number of departures to show (1-7, default: 7)
line_colors:  # Custom colors for specific lines
  - line: "64"
    color: "#FF5722"
  - line: "40"
    color: "#4CAF50"
```

### Card Features

- **Clean, compact display** with line badges, destinations, and minutes
- **Color-coded minutes**: Black (real-time), Red (delayed), Orange (scheduled)
- **Configurable departure count**: Show 1-7 departures
- **Custom line colors**: Set specific colors for different transit lines
- **Visual configuration**: Easy setup through Home Assistant's UI editor
- **Responsive design**: Adapts to different screen sizes

### Alternative: Basic Lovelace Card

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

## License

Apache License 2.0 - see the [LICENSE](LICENSE) file for details.