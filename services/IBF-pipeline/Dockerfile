FROM ubuntu:18.04

RUN apt-get update
RUN apt-get install -y software-properties-common nano python3-pip git wget libxml2-utils

RUN add-apt-repository ppa:ubuntugis/ppa
RUN apt-get update
RUN apt-get install -y python-numpy gdal-bin libgdal-dev postgresql-client libgnutls28-dev

# update pip
RUN python3 -m pip install pip --upgrade
RUN python3 -m pip install wheel numpy

# copy files
RUN mkdir --parents /home/ibf/
WORKDIR /home/ibf/pipeline/

# install dependencies
RUN pip install --upgrade pip
RUN pip install --upgrade pip setuptools wheel
COPY pipeline/requirements.txt /home/ibf/pipeline/
RUN pip install -r requirements.txt 

# set up cronjob
COPY pipeline/entrypoint.sh /home/ibf/pipeline/entrypoint.sh
COPY pipeline/crontab /etc/cron.d/crontab
RUN chmod 0644 /etc/cron.d/crontab
RUN crontab /etc/cron.d/crontab
RUN touch /var/log/cron.log

CMD tail -f /dev/null
