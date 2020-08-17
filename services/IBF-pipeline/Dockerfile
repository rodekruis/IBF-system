# docker build -t ubuntu1604py36
FROM ubuntu:16.04
#FROM typhoon:latest

RUN apt-get update
RUN apt-get install -y software-properties-common nano

#RUN apt-get install -y build-essential python3.6 python3.6-dev python3-pip python3.6-venv
RUN apt-get install -y python3-pip
RUN apt-get install -y git
RUN apt-get install -y wget libxml2-utils

RUN add-apt-repository ppa:ubuntugis/ppa
RUN apt-get update
RUN apt-get install -y python-numpy gdal-bin libgdal-dev

# install psql
RUN apt-get install -y postgresql-client

# update pip
RUN python3 -m pip install pip --upgrade
RUN python3 -m pip install wheel

# copy files
RUN mkdir --parents /home/ibf/
WORKDIR /home/ibf/pipeline/

# install dependencies
COPY pipeline/requirements.txt /home/ibf/pipeline/
RUN pip install -r requirements.txt
ADD pipeline /home/ibf/pipeline
ADD geoserver /home/ibf/geoserver

# set up cronjob
# COPY pipeline/crontab /etc/cron.d/crontab
# RUN chmod 0644 /etc/cron.d/crontab
# RUN crontab /etc/cron.d/crontab
# RUN touch /var/log/cron.log
# CMD cron && tail -f /var/log/cron.log
