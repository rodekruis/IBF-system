import os
import shutil

from settings import GEOSERVER_DATA
from lib.logging.logglySetup import logger

def storeHistoric():
    src = GEOSERVER_DATA + "output/" + str(0)
    dst = GEOSERVER_DATA + "output/" + str(1)
    copytree(src, dst)
    logger.info('storeHistoric: Coppied from' + src + " to " + dst)





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