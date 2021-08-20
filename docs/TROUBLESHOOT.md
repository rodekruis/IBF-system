### Description

Upon running the <docker-compose -f docker-compose.yml -f docker-compose.override.yml up> all the containers are not started mentioned in the docker-compose file. Some containers throw certain errors mentioned below

### To Start/Run the app

◦	docker-compose up -d
◦	docker-compose stop ibf-dashboard
◦	cd interfaces/IBF-dashboard
◦	npm start

### Expected behaviour
All containers mentioned in the docker-compose file /IBF-system/docker-compose.yml be up and running.
Application should load and respond properly on the localhost:4200.

### Desktop (please complete the following information):

OS: MAC OS
Browser : chrome
Version : 92.*

### Workaround
    ◦	If the containers ibf-system_ibf-pipeline , ibf-system_ibf-api-service do not start.
    ◦	If the container do not start automatically via the 'docker compose up' command. The workaround for this would be, manually start the container and run this command.

 docker-compose -f docker-compose.yml -f docker-compose.override.yml up

### After step2 of readme if there is any problem to run the app 
You can try below steps:
    ◦	throw away "IBF-app" schema of your local database : drop schema "IBF-app" cascade;
    ◦	recreate "IBF-app" schema: create schema "IBF-app";
    ◦	select * from "IBF-app".disaster;
	◦	restart api-service: "docker-compose restart ibf-api-service"
    ◦	run: docker-compose exec ibf-api-service
	◦	wait until done, check with: "docker-compose logs -f ibf-api-service"
	◦	run seed script: "docker-compose exec ibf-api-service npm run seed"
	◦	run mock-endpoint : http://localhost:3000/docs/#/scripts/ScriptsController_mockDynamic


### Supporting docker commands
These below commands come in handy when you face such issue:
1 The Docker compose command starts and runs your entire app:
    docker-compose up

2 For dev environment we can use:
    docker-compose -f docker-compose.yml -f docker-compose.override.yml up

3 Execute this will create a container named ibf-api-service and start a Bash session:
    docker-compose exec ibf-api-service bash

4 Execute this command will run the ibf-pipeline for all countries:
    docker-compose exec ibf-pipeline python3 runPipeline.py

5 To run seed script:
    docker-compose exec ibf-api-service npm run seed

6 Detached mode (-d) run command in the background:
    docker-compose up -d ibf-api-service:

7 Create the Docker image from the Dockerfile in this folder through:
    docker build -t ibf-api-service

8 To check the logs of IBF-api-service:
    docker-compose logs -f ibf-api-service

9 To restart the IBF-api-service in docker:
    docker-compose restart ibf-api-service

10 With a single command, you create and start all the services from your configuration:
    docker-compose exec ibf-api-service npm install 


### docker help
You can refer this official docker document [here](https://docs.docker.com/engine/reference/commandline/compose_exec/)