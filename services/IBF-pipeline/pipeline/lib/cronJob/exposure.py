import rasterio
import rasterio.mask
import rasterio.features
import rasterio.warp
from rasterio.features import shapes
import fiona

from lib.logging.logglySetup import logger
from settings import *

class Exposure:

    """Class used to calculate the exposure per exposure type"""
    
    def __init__(self, indicator, source, rasterValue, timeForecast, country_code):
        self.indicator = indicator
        self.source = source
        self.rasterValue = rasterValue
        self.inputRaster = GEOSERVER_INPUT + source + ".tif"
        self.outputRaster = GEOSERVER_OUTPUT + "0/" + source + timeForecast
        self.stats = []
        self.selectionValue = 0.9
        self.tempPath = PIPELINE_TEMP + "out.tif"
        self.ADMIN_BOUNDARIES = PIPELINE_INPUT + SETTINGS[country_code]['admin_boundaries']['filename']
        self.PCODE_COLNAME = SETTINGS[country_code]['admin_boundaries']['pcode_colname']


    def calcAffected(self, floodExtentRaster):
        shapesFlood =  self.loadTiffAsShapes(floodExtentRaster)
        if shapesFlood != []:
            affectedImage, affectedMeta = self.clipTiffWithShapes(self.inputRaster, shapesFlood)

            with rasterio.open(self.outputRaster, "w", **affectedMeta) as dest:
                dest.write(affectedImage)

        logger.info("Wrote to " + self.outputRaster)
        adminBoundaries = self.ADMIN_BOUNDARIES
        self.stats = self.calcStatsPerAdmin(adminBoundaries, self.indicator, shapesFlood)

                 
    def calcStatsPerAdmin(self, adminBoundaries, indicator, shapesFlood):
        stats = []
        with fiona.open(adminBoundaries, "r") as shapefile:

            # Clip affected raster per area
            for area in shapefile:
                if shapesFlood != []: 
                    try: 
                        outImage, outMeta = self.clipTiffWithShapes(self.outputRaster, [area["geometry"]] )
                        
                        # Write clipped raster to tempfile to calculate raster stats
                        with rasterio.open(self.tempPath, "w", **outMeta) as dest:
                            dest.write(outImage)
                            
                        statsDistrict = self.calculateRasterStats(indicator,  str(area['properties'][self.PCODE_COLNAME]), self.tempPath)
                    except ValueError:
                            # If there is no flood in the district set  the stats to 0
                        statsDistrict = {'source': indicator, 'sum': 0, 'district': str(area['properties'][self.PCODE_COLNAME])}
                else: 
                    statsDistrict = {'source': indicator, 'sum': '--', 'district': str(area['properties'][self.PCODE_COLNAME])}        
                stats.append(statsDistrict)
        return stats    

    def calculateRasterStats(self, indicator, district, outFileAffected):
        raster = rasterio.open(outFileAffected)   
        stats = []

        array = raster.read( masked=True)
        band = array[0]
        theSum = band.sum()* self.rasterValue
        stats.append({
            'source': indicator,
            'sum': str(theSum),
            'district': district
            })
        return stats[0]



    def loadTiffAsShapes(self, tiffLocaction):
        allgeom = []
        with rasterio.open(tiffLocaction) as dataset:
            # Read the dataset's valid data mask as a ndarray.
            image = dataset.read(1)
            mask = dataset.dataset_mask()
            theShapes = shapes(image, mask=mask, transform=dataset.transform)
            
            # Extract feature shapes and values from the array.
            for geom, val in theShapes:
                if val >= self.selectionValue:              
                    # Transform shapes from the dataset's own coordinate
                    # reference system to CRS84 (EPSG:4326).
                    geom = rasterio.warp.transform_geom(
                        dataset.crs, 'EPSG:4326', geom, precision=6)
                    # Append everything to one geojson
                    
                    allgeom.append(geom)   
        return allgeom



    def clipTiffWithShapes(self, tiffLocaction, shapes):
        with rasterio.open(tiffLocaction) as src:
            outImage, out_transform = rasterio.mask.mask(src, shapes, crop=True)
            outMeta = src.meta.copy()

        outMeta.update({"driver": "GTiff",
                    "height": outImage.shape[1],
                    "width": outImage.shape[2],
                    "transform": out_transform})

        return outImage, outMeta