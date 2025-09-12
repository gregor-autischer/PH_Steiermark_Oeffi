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
            color: var(--primary-text-color);
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

    let departures = [];
    
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

    // Limit to configured number of departures
    const maxDepartures = this.config.departure_count || 7;
    departures = departures.slice(0, maxDepartures);

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

      // Get custom color for this line
      let lineColor = '';
      if (this.config && this.config.line_colors) {
        const colorConfig = this.config.line_colors.find(lc => lc.line === dep.line);
        if (colorConfig && colorConfig.color) {
          lineColor = `style="background-color: ${colorConfig.color}"`;
        }
      }

      return `
        <div class="departure-row">
          <div class="line-badge" ${lineColor}>${this.escapeHtml(dep.line)}</div>
          <div class="destination">${this.escapeHtml(dep.destination)}</div>
          <div class="time-info">
            <div class="minutes ${statusClass}">
              ${dep.minutes}
            </div>
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
  constructor() {
    super();
    // Material Design Icon for add
    this.addIcon = "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z";
  }

  setConfig(config) {
    this._config = config;
    this.render();
  }

  render() {
    if (!this.hass || !this._config) return;
    
    // Prevent re-rendering if already rendered with same config
    const configString = JSON.stringify(this._config);
    if (this._lastConfigString === configString) return;
    this._lastConfigString = configString;

    const lineColors = this._config.line_colors || [];

    this.innerHTML = `
      <div class="card-config">
        <div class="config-section">
          <h3 class="section-title">Display Configuration</h3>
          <p class="section-description">Choose how many departures to display</p>
          <ha-select
            id="departure_count"
            label="Number of departures"
          >
            ${[1, 2, 3, 4, 5, 6, 7].map(n => `
              <mwc-list-item value="${n}">${n} departure${n > 1 ? 's' : ''}</mwc-list-item>
            `).join('')}
          </ha-select>
        </div>
        
        <div class="config-section">
          <h3 class="section-title">Line Colors</h3>
          <p class="section-description">Set custom colors for specific line numbers</p>
        </div>
        
        <div id="line-colors-container">
          ${lineColors.map((lc, index) => `
            <div class="line-color-row" data-index="${index}">
              <ha-textfield
                class="line-filter"
                label="Line Number"
                placeholder="e.g., 64"
                data-index="${index}"
              ></ha-textfield>
              <input
                type="color"
                class="line-color"
                value="${lc.color || '#2196F3'}"
                title="Choose color"
              />
              <button
                class="remove-line-color"
                data-index="${index}"
                title="Remove"
              >×</button>
            </div>
          `).join('')}
        </div>
        
        <ha-button
          id="add-line-color"
          raised
        ><ha-icon .path="${this.addIcon}"></ha-icon>Add Line Color</ha-button>
      </div>
      <style>
        .card-config {
          padding: 0;
        }
        .config-section {
          margin-bottom: 24px;
        }
        .section-title {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 500;
          color: var(--primary-text-color);
        }
        .section-description {
          margin: 0 0 16px 0;
          color: var(--secondary-text-color);
          font-size: 14px;
        }
        ha-textfield {
          width: 100%;
          margin-bottom: 16px;
          display: block;
        }
        ha-select {
          width: 100%;
          display: block;
        }
        .line-color-row {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          align-items: center;
          height: 56px;
        }
        .line-filter {
          flex: 1;
          min-width: 150px;
          max-width: 50%;
          margin-bottom: 0;
        }
        .line-color {
          width: 60px;
          height: 100%;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          outline: 1px solid var(--outline-color);
          position: relative;
        }
        .line-color:focus {
          outline: 2px solid var(--primary-color);
        }
        ha-button {
          margin-top: 16px;
        }
        ha-button ha-icon {
          margin-right: 8px;
        }
        .remove-line-color {
          width: 32px;
          height: 32px;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          background: var(--card-background-color);
          color: var(--secondary-text-color);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: bold;
        }
        .remove-line-color:hover {
          color: var(--error-color);
          border-color: var(--error-color);
        }
        #add-line-color {
          margin-top: 8px;
          padding-bottom: 16px;
        }
      </style>
    `;
    
    // Set values immediately after creating elements
    const departureSelect = this.querySelector('#departure_count');
    if (departureSelect) {
      departureSelect.value = (this._config.departure_count || 7).toString();
    }
    
    // Set line filter values
    lineColors.forEach((lc, index) => {
      const lineInput = this.querySelector(`.line-filter[data-index="${index}"]`);
      if (lineInput) {
        lineInput.value = lc.line || '';
      }
    });

    // Add event listener for departure count
    const departureCount = this.querySelector('#departure_count');
    if (departureCount) {
      departureCount.addEventListener('change', (e) => {
        this._config = {
          ...this._config,
          departure_count: parseInt(e.target.value)
        };
        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
      });
    }

    // Add line color button
    const addButton = this.querySelector('#add-line-color');
    addButton.addEventListener('click', () => {
      const lineColors = [...(this._config.line_colors || [])];
      lineColors.push({ line: '', color: '#2196F3' });
      this._config = { ...this._config, line_colors: lineColors };
      this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
      this.render();
    });

    // Line color inputs
    this.querySelectorAll('.line-color-row').forEach(row => {
      const index = parseInt(row.dataset.index);
      
      const lineInput = row.querySelector('.line-filter');
      lineInput.addEventListener('change', (e) => {
        const lineColors = [...(this._config.line_colors || [])];
        lineColors[index] = { ...lineColors[index], line: e.target.value };
        this._config = { ...this._config, line_colors: lineColors };
        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
      });

      const colorInput = row.querySelector('.line-color');
      colorInput.addEventListener('change', (e) => {
        e.stopPropagation();
        const lineColors = [...(this._config.line_colors || [])];
        lineColors[index] = { ...lineColors[index], color: e.target.value };
        this._config = { ...this._config, line_colors: lineColors };
        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
      });
      
      // Prevent color picker from closing when clicking inside
      colorInput.addEventListener('click', (e) => {
        e.stopPropagation();
      });
      
      colorInput.addEventListener('mousedown', (e) => {
        e.stopPropagation();
      });

      const removeButton = row.querySelector('.remove-line-color');
      removeButton.addEventListener('click', () => {
        const lineColors = [...(this._config.line_colors || [])];
        lineColors.splice(index, 1);
        this._config = { ...this._config, line_colors: lineColors };
        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
        this.render();
      });
    });
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  get hass() {
    return this._hass;
  }
}

customElements.define('steirische-linien-card', SteirischeLinienCard);
customElements.define('steirische-linien-card-editor', SteirischeLinienCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "steirische-linien-card",
  name: "PH Steiermark Oeffi Card",
  description: "Display transit departures from Steirische Linien",
  preview: false,
  documentationURL: "https://github.com/gregor-autischer/PH_Steiermark_Oeffi"
});