FROM homeassistant/home-assistant:latest

# Copy custom component
COPY custom_components/steirische_linien /config/custom_components/steirische_linien

# Copy dashboard card (optional - from separate repository)
# COPY www/steirische-linien-card.js /config/www/steirische-linien-card.js

# Copy configuration files
COPY docker/configuration.yaml /config/configuration.yaml
COPY docker/ui-lovelace.yaml /config/ui-lovelace.yaml
COPY docker/secrets.yaml /config/secrets.yaml

# Create necessary directories
RUN mkdir -p /config/www

EXPOSE 8123