
# E2464

## Current Service Online Address

You can test the project online at the following address:  
[http://152.7.179.32:3000](http://152.7.179.32:3000)

[http://152.7.179.32:3000/project_topics](http://152.7.179.32:3000/project_topics)

### View Project Topics

To view the current project ('E2464'), open the following link in your browser:  
[http://localhost:3000/project_topics](http://localhost:3000/project_topics)

The page will reload if you make edits, and you will also see any lint errors in the console.

## Admin Credentials

- **Username:** admin  
- **Password:** password123  

## Student Role Credentials

- **Username:** user4  
- **Password:** password123  

## Developing and Deploying with npm

You can also develop and deploy the frontend using npm. Follow these steps:

1. **Clone the Repository**

   Clone the project repository to your local machine:
   ```bash
   git clone https://github.com/arlee-shelby/reimplementation-front-end.git
   cd reimplementation-front-end
   ```

2. **Install Dependencies**

   Install the required dependencies using npm:
   ```bash
   npm install
   ```

3. **Start the Development Server**

   Run the following command to start the development server:
   ```bash
   npm start
   ```

   The app will run in development mode, and you can access it at [http://localhost:3000](http://localhost:3000).

## Backend Required to Deploy the Project with Docker

**Prerequisites:** Docker needs to be installed on the machine where the application is running.

1. **Start the Docker Containers**

   Use the following command to start the containers in detached mode:
   ```bash
   sudo docker compose up -d
   ```

2. **Add the Student Role**

   Run the following command to create a test user (`user4`):
   ```bash
   sudo docker compose exec app rails runner
   User.create(name: 'user4', email: 'user4@example.com', password: 'password123', full_name: 'user4', institution_id: 1, role_id: 5)
   ```

## Project Repository

For more information and access to the project code, visit the GitHub repository: [Reimplementation Frontend](https://github.com/arlee-shelby/reimplementation-front-end)
