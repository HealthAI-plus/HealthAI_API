# HealthAI_API
Eunoia is a sleek and secure chat app designed for empowering conversations. This repository contains both the server and client components of the Eunoia chat system

# Installation:
## Prerequisites:
- **Docker:** Ensure Docker is installed on your system. If not, download and install Docker from [Docker's official website](https://www.docker.com/get-started).

# Installation Steps:
## 1. Clone the Repository: 
*`git clone https://github.com/jahdevelops/HealthAI-plus/HealthAI_API`*
## 2. Setup: 
To set up both the client and server components using Docker, execute the following commands in your terminal:
- *`docker compose up`* <br>
These commands will build and launch the server in standalone docker container, setting up the app in development mode.

## 3. Launching the API server:
Once the setup is complete, visit *http://localhost:4000* in your browser to access the Eunoia chat app client.

## 4. Populating `.env` file
After installing the packages,  create a `.env` file in the root directory. <br />
These variables are required in the `.env` file created above, use any value of you choice. <br />
* PORT
* DB_URL
* NODE_ENV
* USER_JWT_SECRET
* AWS_ACCESS_KEY
* AWS_SECRET_ACCESS_KEY
* AWS_REGION
* COOKIE_PARSER_SECRET
* API_DOMAIN_NAME
* ORGANISATION_EMAIL_ADDRESS
* ORGANISATION_EMAIL_PASSWORD
* ORGANISATION_MAIL_HOST
* CHAT_API_KEY
  
# Using the APIs
A list of all available APIs and documentation can be found <a href='https://klus-healthai.postman.co/workspace/My-Workspace~9078663f-e4d1-42dd-81ee-57bdb202a49b/collection/31301164-f91a6403-2e5e-4f04-923d-f8f73cf979ef?action=share&creator=31301164'> here </a>

# Contributing:
If you're new to contributing to open-source projects or our codebase, here are a few steps to get you started:
- Fork the repository.
- Create a new branch for your work *`git checkout -b feature/your-feature-name`*
- Make changes or additions.
- Commit your changes (git commit -am 'Add new feature').
- Push your changes to your forked repository *`git push origin feature/your-feature-name`*
- Create a pull request against the main branch.

