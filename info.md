# Powerhaus - Steirische Öffis

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)

Public transit departure information for Steirische Linien (Verbund Linie) in Home Assistant.

## Features

- 🚌 Real-time departure information
- ⏱️ Updates every minute
- 📊 7 sensor entities for next departures
- 🔔 Delay indicators
- 📍 Configurable origin/destination coordinates

## Sensor Information

Each sensor shows:
- **State**: Minutes until departure
- **Attributes**:
  - `line`: Transit line number
  - `destination`: Direction
  - `departure_time`: Time (HH:MM)
  - `is_delayed`: Delay status
  - `is_scheduled`: Real-time data availability

## Quick Start

After installation, configure via UI with your origin and destination coordinates.

Default route: HBG → LKH Graz Auenbrugger Platz 15