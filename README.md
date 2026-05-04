# ITI Branch Viewer

A web application for managing and visualizing ITI branches. This project uses a Node.js backend with an Express server and a PostgreSQL database with PostGIS extensions to handle spatial data.

## Features

- **Branch Visualization**: Fetch branch locations as GeoJSON for mapping.
- **Statistics**: View total branch counts and track distribution.
- **Management**: Add new branches with coordinates and delete existing ones.
- **Authentication**: Simple administrative login.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/) with [PostGIS](https://postgis.net/) extension installed.

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd myProject
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Database Setup:**
    Ensure your PostgreSQL server is running and create a database named `sandbox`. You will need a table named `iti_branches` with the following approximate schema:
    ```sql
    CREATE TABLE iti_branches (
        id SERIAL PRIMARY KEY,
        "Branch" TEXT,
        "Longitude" DOUBLE PRECISION,
        "Latitude" DOUBLE PRECISION,
        tracks TEXT,
        geom GEOMETRY(Point, 4326)
    );
    ```

4.  **Environment Variables:**
    Create a `.env` file in the root directory and add your database credentials:
    ```env
    DB_USERNAME=your_username
    DB_PASSWORD=your_password
    PORT=3000
    ```

## Usage

Start the server:
```bash
node server.js
```
The application will be available at `http://localhost:3000`.

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/api/branches` | Returns all branches as a GeoJSON FeatureCollection. |
| GET | `/api/branches/stats` | Returns total branch count and track distribution stats. |
| POST | `/api/add-branch` | Adds a new branch (Required: name, tracks, x, y). |
| DELETE | `/api/branches/:id` | Deletes a branch by ID. |