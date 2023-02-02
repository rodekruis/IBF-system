import { IconOptions, MapOptions } from 'leaflet';
import { DisasterTypeKey } from 'src/app/types/disaster-type-key';
import { environment } from 'src/environments/environment';

export const DEBUG_LOG = environment.configuration === 'development';

export const DEBOUNCE_TIME_LOADER = 500;

export const LEAFLET_MAP_URL_TEMPLATE =
  'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';
export const LEAFLET_MAP_ATTRIBUTION =
  '&copy; <a target="_blank" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a target="_blank" href="https://carto.com/attributions">Carto</a>';

export const LEAFLET_MARKER_ICON_OPTIONS_BASE: IconOptions = {
  iconSize: [30, 50],
  iconAnchor: [15, 50],
  popupAnchor: [0, -30],
  iconUrl: 'assets/markers/glofas-station-default-marker.svg',
  iconRetinaUrl: 'assets/markers/glofas-station-default-marker.svg',
};

export const LEAFLET_MARKER_ICON_OPTIONS_DAM: IconOptions = {
  ...LEAFLET_MARKER_ICON_OPTIONS_BASE,
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  iconUrl: 'assets/markers/dam-marker.svg',
  iconRetinaUrl: 'assets/markers/dam-marker.svg',
};

export const LEAFLET_MARKER_ICON_OPTIONS_RED_CROSS_BRANCH: IconOptions = {
  ...LEAFLET_MARKER_ICON_OPTIONS_BASE,
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  iconUrl: 'assets/markers/red-cross-marker.svg',
  iconRetinaUrl: 'assets/markers/red-cross-marker.svg',
};

export const LEAFLET_MARKER_ICON_OPTIONS_HEALTH_POINT: IconOptions = {
  ...LEAFLET_MARKER_ICON_OPTIONS_BASE,
  iconSize: [33, 33],
  iconAnchor: [17, 33],
  iconUrl: 'assets/markers/health-center-marker.svg',
  iconRetinaUrl: 'assets/markers/health-center-marker.svg',
};

export const LEAFLET_MARKER_ICON_OPTIONS_HEALTH_POINT_HOSPITAL: IconOptions = {
  ...LEAFLET_MARKER_ICON_OPTIONS_BASE,
  iconSize: [33, 33],
  iconAnchor: [17, 33],
  iconUrl: 'assets/markers/health-center-marker.svg',
  iconRetinaUrl: 'assets/markers/health-center-marker.svg',
};

export const LEAFLET_MARKER_ICON_OPTIONS_WATER_POINT: IconOptions = {
  ...LEAFLET_MARKER_ICON_OPTIONS_BASE,
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  iconUrl: 'assets/markers/water-point-marker.svg',
  iconRetinaUrl: 'assets/markers/water-point-marker.svg',
};

export const LEAFLET_MARKER_ICON_OPTIONS_EVACUATION_CENTER: IconOptions = {
  ...LEAFLET_MARKER_ICON_OPTIONS_BASE,
  iconSize: [30, 50],
  iconAnchor: [15, 50],
  iconUrl: 'assets/markers/evacuation-center-marker.svg',
  iconRetinaUrl: 'assets/markers/evacuation-center-marker.svg',
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
    disabled: '/assets/icons/Flood_Disabled.svg',
  },
  [DisasterTypeKey.malaria]: {
    selectedTriggered: '/assets/icons/Malaria_Selected_Triggered.svg',
    selectedNonTriggered: '/assets/icons/Malaria_Selected_Non Triggered.svg',
    nonSelectedTriggered: '/assets/icons/Malaria_Not Selected_Triggered.svg',
    nonSelectedNonTriggered:
      '/assets/icons/Malaria_Not Selected_Non Triggered.svg',
    disabled: '/assets/icons/Malaria_Disabled.svg',
  },
  [DisasterTypeKey.dengue]: {
    selectedTriggered: '/assets/icons/Dengue_Selected_Triggered.svg',
    selectedNonTriggered: '/assets/icons/Dengue_Selected_Non Triggered.svg',
    nonSelectedTriggered: '/assets/icons/Dengue_Not Selected_Triggered.svg',
    nonSelectedNonTriggered:
      '/assets/icons/Dengue_Not Selected_Non Triggered.svg',
    disabled: '/assets/icons/Dengue_Disabled.svg',
  },
  [DisasterTypeKey.drought]: {
    selectedTriggered: '/assets/icons/Drought_Selected_Triggered.svg',
    selectedNonTriggered: '/assets/icons/Drought_Selected_Not Triggered.svg',
    nonSelectedTriggered: '/assets/icons/Drought_Not Selected_Triggered.svg',
    nonSelectedNonTriggered:
      '/assets/icons/Drought_Not Selected_Not Triggered.svg',
    disabled: '/assets/icons/Drought_Disabled.svg',
  },
  [DisasterTypeKey.heavyRain]: {
    selectedTriggered: '/assets/icons/Heavy Rain_Selected_Triggered.svg',
    selectedNonTriggered: '/assets/icons/Heavy Rain_Selected_Not Triggered.svg',
    nonSelectedTriggered: '/assets/icons/Heavy Rain_Not Selected_Triggered.svg',
    nonSelectedNonTriggered:
      '/assets/icons/Heavy Rain_Not Selected_Not Triggered.svg',
    disabled: '/assets/icons/Heavy Rain_Disabled.svg',
  },
  [DisasterTypeKey.typhoon]: {
    selectedTriggered:
      '/assets/icons/TyphoonHurricaneCyclone_Selected_Triggered.svg',
    selectedNonTriggered:
      '/assets/icons/TyphoonHurricaneCyclone_Selected_Not Triggered.svg',
    nonSelectedTriggered:
      '/assets/icons/TyphoonHurricaneCyclone_Not Selected_Triggered.svg',
    nonSelectedNonTriggered:
      '/assets/icons/TyphoonHurricaneCyclone_Not Selected_Not Triggered.svg',
    disabled: '/assets/icons/TyphoonHurricaneCyclone_Disabled.svg',
  },
};
