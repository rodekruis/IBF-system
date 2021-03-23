FROM ubuntu:18.04

RUN apt-get update && apt-get install -y \
    software-properties-common \
    nano \
    vim \
    python3-pip \
    git \
    wget \
    libxml2-utils \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get purge --auto-remove \
    && apt-get clean

RUN add-apt-repository ppa:ubuntugis/ppa \
    && apt-get update \
    && apt-get install --no-install-recommends -y \
    python-numpy \
    gdal-bin \
    libgdal-dev \
    postgresql-client \
    libgnutls28-dev \
    libgnutls28-dev \
    libspatialindex-dev \
    libeccodes0 \
    gfortran \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get purge --auto-remove \
    && apt-get clean

RUN wget ftp://ftp.cpc.ncep.noaa.gov/wd51we/wgrib2/wgrib2.tgz \
    -O /tmp/wgrib2.tgz \
    && mkdir -p /usr/bin/grib2/ \
    && cd /tmp/ \
    && tar -xf /tmp/wgrib2.tgz \
    && rm -r /tmp/wgrib2.tgz \
    && cp -r /tmp/grib2/ /usr/bin/grib2/ && rm -R /tmp/grib2/ \
    && cd /usr/bin/grib2/grib2 \
    && export FC=gfortran && export CC=gcc \
    && make \
    && ln -s /usr/bin/grib2/grib2/wgrib2/wgrib2 /usr/bin/wgrib2 \
    && apt-get -y autoremove build-essential

# update pip
RUN python3 -m pip install --no-cache-dir \
    pip \
    setuptools \
    wheel \
    --upgrade \
    && python3 -m pip install --no-cache-dir numpy

# copy files
RUN mkdir --parents /home/ibf/
WORKDIR /home/ibf/pipeline/

# install dependencies
COPY pipeline/requirements.txt /home/ibf/pipeline/
RUN pip install -r requirements.txt

# set up cronjob
COPY pipeline/entrypoint.sh /home/ibf/pipeline/entrypoint.sh
COPY pipeline/crontab /etc/cron.d/crontab
RUN chmod 0644 /etc/cron.d/crontab
RUN crontab /etc/cron.d/crontab
RUN touch /var/log/cron.log

CMD tail -f /dev/null
