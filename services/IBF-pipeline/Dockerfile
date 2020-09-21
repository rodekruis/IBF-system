# docker build -t ubuntu1604py36
FROM ubuntu:18.04
#FROM typhoon:latest

RUN apt-get update
RUN apt-get install -y software-properties-common nano

#RUN apt-get install -y build-essential python3.6 python3.6-dev python3-pip python3.6-venv
RUN apt-get install -y python3-pip
RUN apt-get install -y git
RUN apt-get install -y wget libxml2-utils

RUN apt-get install -y libgnutls28-dev libspatialindex-dev libeccodes0 
RUN apt-get install -y gfortran
RUN wget ftp://ftp.cpc.ncep.noaa.gov/wd51we/wgrib2/wgrib2.tgz -O /tmp/wgrib2.tgz && \
    mkdir -p /usr/bin/grib2/ && \
    cd /tmp/ && \
    tar -xf /tmp/wgrib2.tgz && \
    rm -r /tmp/wgrib2.tgz && \
    mv /tmp/grib2/ /usr/bin/grib2/ && \
    cd /usr/bin/grib2/grib2 && \
    export FC=gfortran && export CC=gcc \
    make && \
    ln -s /usr/bin/grib2/grib2/wgrib2/wgrib2 /usr/bin/wgrib2 && \
    apt-get -y autoremove build-essential

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
#ADD geoserver /home/ibf/geoserver # comment this line

# set up cronjob
# COPY pipeline/crontab /etc/cron.d/crontab
# RUN chmod 0644 /etc/cron.d/crontab
# RUN crontab /etc/cron.d/crontab
# RUN touch /var/log/cron.log
# CMD cron && tail -f /var/log/cron.log
