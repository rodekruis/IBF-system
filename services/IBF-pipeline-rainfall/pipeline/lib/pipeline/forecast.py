from lib.pipeline.rainfalldata import RainfallData
from lib.pipeline.exposure import Exposure
from lib.pipeline.dynamicDataDb import DatabaseManager
import pandas as pd
import json
from shapely import wkb, wkt
import geopandas


class Forecast:
    def __init__(self, leadTimeLabel, leadTimeValue, countryCodeISO3, admin_level):
        self.leadTimeLabel = leadTimeLabel
        self.leadTimeValue = leadTimeValue
        self.admin_level = admin_level
        self.db = DatabaseManager(leadTimeLabel, countryCodeISO3)

        admin_area_json = self.db.apiGetRequest('admin-areas/raw',countryCodeISO3=countryCodeISO3)
        for index in range(len(admin_area_json)):
            admin_area_json[index]['geometry'] = admin_area_json[index]['geom']
            admin_area_json[index]['properties'] = {
                'placeCode': admin_area_json[index]['placeCode'],
                'name': admin_area_json[index]['name']
            }
        self.admin_area_gdf = geopandas.GeoDataFrame.from_features(admin_area_json)
        self.population_total = self.db.apiGetRequest('admin-area-data/{}/{}/{}'.format(countryCodeISO3, self.admin_level, 'populationTotal'), countryCodeISO3='')

        self.rainfall_triggers = self.db.apiGetRequest('rainfall-triggers',countryCodeISO3=countryCodeISO3)
        self.rainfallData = RainfallData(leadTimeLabel, leadTimeValue, countryCodeISO3, self.admin_area_gdf, self.rainfall_triggers)
        self.exposure = Exposure(leadTimeLabel, countryCodeISO3, self.admin_area_gdf, self.population_total, self.admin_level)
