from lib.logging.logglySetup import logger
from lib.pipeline.glofasdata import GlofasData
from lib.pipeline.rainfalldata import RainfallData
from lib.pipeline.floodExtent import FloodExtent
from lib.pipeline.exposure import Exposure
from lib.pipeline.dynamicDataDb import DatabaseManager
import pandas as pd    
import json
from shapely import wkb, wkt
import geopandas


class Forecast:
    def __init__(self, leadTimeLabel, leadTimeValue, country_code, model):
        self.leadTimeLabel = leadTimeLabel
        self.leadTimeValue = leadTimeValue 
        self.db = DatabaseManager(leadTimeLabel, country_code)

        self.admin_area_gdf = self.db.downloadGeoDataFromDb('IBF-app','adminArea', country_code=country_code)
        # self.admin_area_gdf = self.db.apiGetRequest('adminAreas',country_code=country_code)
        # print(type(self.admin_area_gdf[0]))
        # for index in range(len(self.admin_area_gdf)):
        #     self.admin_area_gdf[index]['geometry'] = self.admin_area_gdf[index]['geom']
        #     self.admin_area_gdf[index]['properties'] = {
        #         'placeCode': self.admin_area_gdf[index]['placeCode'],
        #         'name': self.admin_area_gdf[index]['name']
        #     }
        # print(self.admin_area_gdf[0])
        # admin_gdf = geopandas.GeoDataFrame.from_features(self.admin_area_gdf)
        # print(admin_gdf.head(10))
        # admin_df = pd.read_json(json.dumps(self.admin_area_gdf))
        # print(admin_df.head(10))
        # # admin_df['geom2'] = admin_df.geom.apply(lambda x: wkb.dumps(x))
        # # print(admin_df.head(10))
        # admin_df['coordinates'] = geopandas.GeoSeries.from_wkb(admin_df['geometry'])
        # print(admin_df.head(10))
        # gdf = geopandas.GeoDataFrame(admin_df, geometry='coordinates')
        # print(admin_gdf.head(10))
        
        if model == 'glofas':
            self.glofas_stations = self.db.apiGetRequest('glofasStations',country_code=country_code)
            self.district_mapping = self.db.apiGetRequest('adminAreas/station-mapping',country_code=country_code)
            self.glofasData = GlofasData(leadTimeLabel, leadTimeValue, country_code, self.glofas_stations,self.district_mapping)
            self.floodExtent = FloodExtent(leadTimeLabel, leadTimeValue, country_code,self.district_mapping,self.admin_area_gdf)
            self.exposure = Exposure(leadTimeLabel, country_code,self.admin_area_gdf,self.district_mapping)
  
        if model == 'rainfall':
            self.rainfall_triggers = self.db.apiGetRequest('rainfallTriggers',country_code=country_code)
            self.rainfallData = RainfallData(leadTimeLabel, leadTimeValue, country_code, self.admin_area_gdf, self.rainfall_triggers)
            self.exposure = Exposure(leadTimeLabel, country_code, self.admin_area_gdf)
