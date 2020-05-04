import os
from os import listdir
from os.path import isfile, join
import pandas as pd
import sys
import json
import datetime
import logging
import urllib.request
import urllib.error
import tarfile
import time
import requests
import urllib.request
from lib.logging.logglySetup import logger
from settings import GLOFAS_FTP, PIPELINE_DATA, PIPELINE_OUTPUT, GLOFAS_DUMMY, WATERSTATIONS_TRIGGERS
from secrets import LIZARD_USER, LIZARD_PW


class LizardData:

    def __init__(self):
        self.lizardPath = 'https://nxt3.staging.lizard.net/api/v3/labels/?label_type__uuid=19f39b9a-f51c-4569-bd3c-61c8b1e734cd&valid_at=2019-08-06T00:00:00Z&page_size=1000&format=json'
        self.lizardPathNext = 'https://nxt3.staging.lizard.net/api/v3/labels/?label_type__uuid=19f39b9a-f51c-4569-bd3c-61c8b1e734cd&valid_at=2019-08-06T00:00:00Z&page_size=1000&page=cD0zMzgyNTk%3D'
        self.outputPath = PIPELINE_OUTPUT + 'lizard/lizard_output.json'

    def process(self):
        self.download()

    def download(self):
        headers = {
            'username': LIZARD_USER, 
            'password': LIZARD_PW, 
            'Content-Type': 'application/json'        
        }
        with requests.Session() as s:
            r1 = s.get(self.lizardPath, headers=headers)
            res1 = json.loads(r1.text)['results']
            res = []
            for i in res1:
                res.append(i['extra'])
            r2 = s.get(self.lizardPathNext, headers=headers)
            res2 = json.loads(r2.text)['results']
            for i in res2:
                res.append(i['extra'])
            with open(self.outputPath, 'w') as fp:
                json.dump(res, fp)
                print('Lizard output saved to file')
