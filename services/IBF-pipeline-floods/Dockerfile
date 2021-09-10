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
