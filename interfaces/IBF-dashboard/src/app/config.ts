import { IconOptions, MapOptions } from 'leaflet';
import { environment } from 'src/environments/environment';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';

export const DEBUG_LOG = environment.configuration === 'development';

export const DEBOUNCE_TIME_LOADER = 500;

export const LEAFLET_MAP_URL_TEMPLATE =
  'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';
export const LEAFLET_MAP_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">Carto</a>';

export const LEAFLET_MARKER_ICON_OPTIONS_BASE: IconOptions = {
  iconSize: [25, 41],
  iconAnchor: [13, 41],
  popupAnchor: [0, -30],
  iconUrl: 'assets/markers/glofas-no.svg',
  iconRetinaUrl: 'assets/markers/glofas-no.svg',
};

export const LEAFLET_MARKER_ICON_OPTIONS_RED_CROSS_BRANCH: IconOptions = {
  ...LEAFLET_MARKER_ICON_OPTIONS_BASE,
  iconSize: [20, 33],
  iconUrl: 'assets/markers/red-cross.png',
  iconRetinaUrl: 'assets/markers/red-cross.png',
};

export const LEAFLET_MARKER_ICON_OPTIONS_HEALTH_POINT: IconOptions = {
  ...LEAFLET_MARKER_ICON_OPTIONS_BASE,
  iconSize: [33, 33],
  iconUrl: 'assets/markers/health-facility.png',
  iconRetinaUrl: 'assets/markers/health-facility.png',
};

export const LEAFLET_MARKER_ICON_OPTIONS_WATER_POINT: IconOptions = {
  ...LEAFLET_MARKER_ICON_OPTIONS_BASE,
  iconSize: [20, 33],
  iconUrl: 'assets/markers/waterpoint.png',
  iconRetinaUrl: 'assets/markers/waterpoint.png',
};

export const LEAFLET_MAP_OPTIONS: MapOptions = {
  zoom: 5,
  layers: [],
};

export const DISASTER_TYPES_SVG_MAP = {
  [DisasterTypeKey.floods]: '/assets/icons/Flood.svg',
  [DisasterTypeKey.dengue]: '/assets/icons/Mosquito.svg',
  [DisasterTypeKey.malaria]: '/assets/icons/Mosquito.svg',
  [DisasterTypeKey.heavyRain]: '/assets/icons/Alert.svg',
}
