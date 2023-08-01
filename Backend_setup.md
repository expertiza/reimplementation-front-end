Setup Reimplementation Backend
=================================

**Purpose of the Guide**: The purpose of the guide is to setup Backend to generate data in the Frontend of Expertiza

## STEP 1:  Clone forked github repository in your local system 

Fork the [Reimplementation-back-end repository](https://github.com/expertiza/reimplementation-back-end) and clone it in your local system.

## STEP 2 : Setup backend through you local system

1) Install [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2) Open terminal in your local repository and run:
   ```bash
   docker-compose build
   ```
3) Once the docker container is built in your Docker Desktop, run:
   ```bash
   docker-compose up
   ```
4) Add **Remote Development** as an extension in your IDE.
5) Click on the Remote Explorer (Green arrow buttons) in the Status bar and click on **Attach to Running Container**.
6) Select the **/reimplemtation-back-end-app-1** option. This will open a new project window names App[Container Reimplementation-back-end-app].
7) In the terminal of the new project, if not in app directory, type:
   ```bash
   cd /app
   ```
9) In the app directory, type:
    ```bash
    rake db:create
    ```
    ```bash
    rake db:migrate
    ```
    ```bash
    rails s
    
