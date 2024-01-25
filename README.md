# Natours API

![Natours Logo](https://www.natours.dev/img/logo-green.png)

> An API backend for the Natours project using Node.js, Express, Pug, and following the MVC architecture. Originally part of the Udemy course by Jonas Schmedtmann.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Overview

This project is the backend for the Natours project, implementing a RESTful API using Node.js and Express. It follows the MVC (Model-View-Controller) architecture and uses Pug as the view engine.

## Features

- RESTful API endpoints for managing tours, users, reviews, etc.
- MVC architecture for clean code organization.
- Pug templates for dynamic HTML rendering.
- Authentication and authorization for secure endpoints.
- MongoDB with mongoose client
- MongoDB geospatial queries
- MapBox
- SMTP with Brevo
## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js installed
- npm (Node Package Manager) installed
- MongoDB installed and running

## Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/MoSobhy01/Natours
    ```

2. **Navigate to the project directory:**

    ```bash
    cd Natours
    ```

3. **Install dependencies:**

    ```bash
    npm install
    ```

## Usage

1. **Configure environment variables:**

    Create a `.env` file in the root directory and add the following:

    ```env
    NODE_ENV=development
    PORT=8000
    DATABASE_PASSWORD=...
    DATABASE=...
    DATABASE_LOCAL=...
    JWT_SECRET=...
    JWT_EXPIRES_IN=...
    JWT_EXPIRES_IN_d=...
    EMAIL_HOST=...
    EMAIL_PORT=...
    EMAIL_USER=...
    EMAIL_PASS=...
    EMAIL_ADDERESS=...
    BREVO_USER=...
    BREVO_PASSWORD=...
    ```

2. **Start the server:**

    ```bash
    npm start
    ```

3. **Access the API at [http://localhost:8000](http://localhost:8000)**


## Contributing

1. **Fork the project.**
2. **Create your feature branch (`git checkout -b feature/your-feature`).**
3. **Commit your changes (`git commit -m 'Add some feature'`).**
4. **Push to the branch (`git push origin feature/your-feature`).**
5. **Open a pull request.**

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Jonas Schmedtmann](https://github.com/jonasschmedtmann) - For the original Natours project on Udemy.

