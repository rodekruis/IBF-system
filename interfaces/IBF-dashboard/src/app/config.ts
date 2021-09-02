import { IconOptions, MapOptions } from 'leaflet';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';
import { environment } from 'src/environments/environment';

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

//DAM svg icon
export const LEAFLET_MARKER_ICON_OPTIONS_DAM: IconOptions = {
  ...LEAFLET_MARKER_ICON_OPTIONS_BASE,
  iconSize: [20, 33],
  iconUrl: 'assets/markers/dam.png',
  iconRetinaUrl: 'assets/markers/dam.png',
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
  [DisasterTypeKey.floods]: {
    selectedTriggered: '/assets/icons/Flood_Selected_Triggered.svg',
    selectedNonTriggered: '/assets/icons/Flood_Selected_Non Triggered.svg',
    nonSelectedTriggered: '/assets/icons/Flood_Not Selected_Triggered.svg',
    nonSelectedNonTriggered:
      '/assets/icons/Flood_Not Selected_Non Triggered.svg',
  },
  [DisasterTypeKey.malaria]: {
    selectedTriggered: '/assets/icons/Malaria_Selected_Triggered.svg',
    selectedNonTriggered: '/assets/icons/Malaria_Selected_Non Triggered.svg',
    nonSelectedTriggered: '/assets/icons/Malaria_Not Selected_Triggered.svg',
    nonSelectedNonTriggered:
      '/assets/icons/Malaria_Not Selected_Non Triggered.svg',
  },
  [DisasterTypeKey.dengue]: {
    selectedTriggered: '/assets/icons/Dengue_Selected_Triggered.svg',
    selectedNonTriggered: '/assets/icons/Dengue_Selected_Non Triggered.svg',
    nonSelectedTriggered: '/assets/icons/Dengue_Not Selected_Triggered.svg',
    nonSelectedNonTriggered:
      '/assets/icons/Dengue_Not Selected_Non Triggered.svg',
  },
  [DisasterTypeKey.drought]: {
    selectedTriggered: '/assets/icons/Drought_Selected_Triggered.svg',
    selectedNonTriggered: '/assets/icons/Drought_Selected_Not Triggered.svg',
    nonSelectedTriggered: '/assets/icons/Drought_Not Selected_Triggered.svg',
    nonSelectedNonTriggered:
      '/assets/icons/Drought_Not Selected_Not Triggered.svg',
  },
  [DisasterTypeKey.heavyRain]: {
    selectedTriggered: '/assets/icons/Heavy Rain_Selected_Triggered.svg',
    selectedNonTriggered: '/assets/icons/Heavy Rain_Selected_Not Triggered.svg',
    nonSelectedTriggered: '/assets/icons/Heavy Rain_Not Selected_Triggered.svg',
    nonSelectedNonTriggered:
      '/assets/icons/Heavy Rain_Not Selected_Not Triggered.svg',
  },
};
