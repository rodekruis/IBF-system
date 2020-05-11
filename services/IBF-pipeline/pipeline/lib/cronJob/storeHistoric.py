import os
import shutil

from settings import GEOSERVER_DATA, NUMBER_OF_HISTORIC_FORECASTS
from lib.logging.logglySetup import logger

def storeHistoric():

    i = NUMBER_OF_HISTORIC_FORECASTS - 1
    while i > 0 :
        src = GEOSERVER_DATA + "output/" + str(i-1)
        dst = GEOSERVER_DATA + "output/" + str(i)
        copytree(src, dst)
        logger.info('storeHistoric: Coppied from' + src + " to " + dst)
        i = i -1





def copytree(src, dst, symlinks=False, ignore=None):
    if os.path.exists(dst):
        shutil.rmtree(dst)
    for item in os.listdir(src):
        s = os.path.join(src, item)
        d = os.path.join(dst, item)
        if os.path.isdir(s):
            shutil.copytree(s, d, symlinks, ignore)
        else:
            shutil.copy2(s, d)