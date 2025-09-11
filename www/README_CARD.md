# Steirische Linien Dashboard Card

This custom card displays all 7 transit lines with their destinations and next departures in a clean, organized format.

## Installation

1. Copy the `steirische-linien-card.js` file to your Home Assistant's `www` folder
2. Add the card as a resource in your Lovelace configuration

### Adding as a Resource

#### Via UI:
1. Go to Settings → Dashboards → Resources
2. Click "Add Resource"
3. URL: `/local/steirische-linien-card.js`
4. Resource type: JavaScript Module

#### Via YAML:
Add to your `configuration.yaml`:
```yaml
lovelace:
  resources:
    - url: /local/steirische-linien-card.js
      type: module
```

## Usage

### Basic Configuration

Add the card to your dashboard:

```yaml
type: custom:steirische-linien-card
```

The card will automatically use the default sensor entities (`sensor.transit_departure_1` through `sensor.transit_departure_7`).

### Custom Sensor Configuration

If your sensors have different entity IDs, you can specify them:

```yaml
type: custom:steirische-linien-card
sensor_1: sensor.transit_departure_1
sensor_2: sensor.transit_departure_2
sensor_3: sensor.transit_departure_3
sensor_4: sensor.transit_departure_4
sensor_5: sensor.transit_departure_5
sensor_6: sensor.transit_departure_6
sensor_7: sensor.transit_departure_7
```

## Features

- **Live Updates**: Automatically updates when sensor data changes
- **Smart Display**: Shows line number, destination, and time until departure
- **Status Indicators**: 
  - Red text for delayed departures
  - Orange text for scheduled (non-live) departures
  - Blue for live real-time departures
- **Responsive Design**: Adapts to different screen sizes
- **Clean UI**: Matches Home Assistant's design language

## Card Display

The card shows:
- **Line Badge**: The transit line number in a colored badge
- **Destination**: Where the line is heading
- **Minutes**: Time until departure in minutes
- **Departure Time**: Actual departure time (HH:MM format)
- **Status**: Visual indicators for delays or scheduled-only times

## Troubleshooting

1. **Card not showing**: Ensure the JavaScript file is in the `www` folder and properly added as a resource
2. **No departures shown**: Check that your sensor entities are working and have the correct attributes
3. **Wrong sensors**: Use the visual editor or YAML to specify the correct sensor entity IDs

## Visual Editor Support

The card includes a visual configuration editor that appears when you add or edit the card through the UI.