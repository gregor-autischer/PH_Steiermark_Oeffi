class SteirischeLinienCard extends HTMLElement {
  set hass(hass) {
    this._hass = hass;
    
    if (!this.content) {
      this.innerHTML = `
        <ha-card>
          <div class="card-content">
            <div class="departures-container"></div>
          </div>
        </ha-card>
        <style>
          .departures-container {
            padding: 0;
          }
          .departure-row {
            display: flex;
            align-items: center;
            padding: 4px 0;
            border-bottom: 1px solid var(--divider-color);
          }
          .departure-row:first-child {
            padding-top: 0;
          }
          .departure-row:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }
          .line-badge {
            min-width: 30px;
            height: 24px;
            background-color: var(--primary-color);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            font-weight: bold;
            margin-right: 12px;
            padding: 0 4px;
          }
          .destination {
            flex: 1;
            color: var(--primary-text-color);
            font-size: 14px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .time-info {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            margin-left: 12px;
          }
          .minutes {
            font-size: 18px;
            font-weight: bold;
            color: var(--primary-color);
          }
          .minutes-label {
            font-size: 12px;
            color: var(--secondary-text-color);
            margin-left: 2px;
          }
          .delayed {
            color: var(--error-color);
          }
          .scheduled {
            color: var(--warning-color);
          }
          .status-indicator {
            font-size: 10px;
            margin-top: 2px;
            font-weight: 500;
          }
          .no-departures {
            padding: 20px;
            text-align: center;
            color: var(--secondary-text-color);
          }
          @media (max-width: 400px) {
            .destination {
              font-size: 12px;
            }
            .line-badge {
              min-width: 40px;
              height: 25px;
              font-size: 14px;
            }
          }
        </style>
      `;
      this.content = this.querySelector(".departures-container");
    }

    this.updateDepartures();
  }

  updateDepartures() {
    if (!this._hass || !this.config) return;

    const departures = [];
    
    // Collect all 7 departure sensors
    for (let i = 1; i <= 7; i++) {
      const entityId = this.config[`sensor_${i}`] || `sensor.transit_departure_${i}`;
      const entity = this._hass.states[entityId];
      
      if (entity && entity.state !== 'unavailable' && entity.state !== 'unknown') {
        const attributes = entity.attributes;
        
        if (attributes.line) {
          departures.push({
            line: attributes.line,
            destination: attributes.destination || 'Unknown',
            minutes: parseInt(entity.state) || 0,
            time: attributes.departure_time || '',
            isDelayed: attributes.is_delayed || false,
            isScheduled: attributes.is_scheduled || false,
            index: i
          });
        }
      }
    }

    // Sort by minutes
    departures.sort((a, b) => a.minutes - b.minutes);

    // Render departures
    if (departures.length === 0) {
      this.content.innerHTML = '<div class="no-departures">Keine Abfahrten verfügbar</div>';
      return;
    }

    this.content.innerHTML = departures.map(dep => {
      let statusClass = '';
      let statusText = '';
      
      if (dep.isDelayed) {
        statusClass = 'delayed';
        statusText = 'VERSPÄTET';
      } else if (dep.isScheduled) {
        statusClass = 'scheduled';
        statusText = 'FAHRPLAN';
      }

      return `
        <div class="departure-row">
          <div class="line-badge">${this.escapeHtml(dep.line)}</div>
          <div class="destination">${this.escapeHtml(dep.destination)}</div>
          <div class="time-info">
            <div class="minutes ${statusClass}">
              ${dep.minutes}<span class="minutes-label">min</span>
            </div>
            ${statusText ? `<div class="status-indicator ${statusClass}">${statusText}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  setConfig(config) {
    if (!config) {
      throw new Error('Invalid configuration');
    }
    this.config = config;
  }

  getCardSize() {
    return 3;
  }

  static getConfigElement() {
    return document.createElement("steirische-linien-card-editor");
  }

  static getStubConfig() {
    return {
      sensor_1: "sensor.transit_departure_1",
      sensor_2: "sensor.transit_departure_2",
      sensor_3: "sensor.transit_departure_3",
      sensor_4: "sensor.transit_departure_4",
      sensor_5: "sensor.transit_departure_5",
      sensor_6: "sensor.transit_departure_6",
      sensor_7: "sensor.transit_departure_7"
    };
  }
}

// Card Editor
class SteirischeLinienCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this.render();
  }

  render() {
    if (!this.hass) return;

    this.innerHTML = `
      <div class="card-config">
        <div class="config-header">
          <h3>Steirische Linien Card Configuration</h3>
          <p>Configure the sensor entities for each departure (optional)</p>
        </div>
        ${[1, 2, 3, 4, 5, 6, 7].map(i => `
          <div class="config-row">
            <label for="sensor_${i}">Departure ${i} Sensor:</label>
            <input
              type="text"
              id="sensor_${i}"
              value="${this._config[`sensor_${i}`] || `sensor.transit_departure_${i}`}"
              placeholder="sensor.transit_departure_${i}"
            />
          </div>
        `).join('')}
      </div>
      <style>
        .card-config {
          padding: 16px;
        }
        .config-header {
          margin-bottom: 16px;
        }
        .config-header h3 {
          margin: 0 0 8px 0;
        }
        .config-header p {
          margin: 0;
          color: var(--secondary-text-color);
          font-size: 14px;
        }
        .config-row {
          margin-bottom: 12px;
        }
        .config-row label {
          display: block;
          margin-bottom: 4px;
          font-size: 14px;
          color: var(--primary-text-color);
        }
        .config-row input {
          width: 100%;
          padding: 8px;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          background-color: var(--card-background-color);
          color: var(--primary-text-color);
        }
      </style>
    `;

    // Add event listeners
    [1, 2, 3, 4, 5, 6, 7].forEach(i => {
      const input = this.querySelector(`#sensor_${i}`);
      input.addEventListener('input', (e) => {
        this._config = {
          ...this._config,
          [`sensor_${i}`]: e.target.value
        };
        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
      });
    });
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }
}

customElements.define('steirische-linien-card', SteirischeLinienCard);
customElements.define('steirische-linien-card-editor', SteirischeLinienCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "steirische-linien-card",
  name: "Steirische Linien Card",
  description: "Display transit departures from Steirische Linien",
  preview: false,
  documentationURL: "https://github.com/gregor-autischer/PH_Steiermark_Oeffi"
});