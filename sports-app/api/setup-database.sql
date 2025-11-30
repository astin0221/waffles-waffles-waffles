-- Sports App Database Setup Script
-- Run this script to create the database

-- Create the database (run this as postgres user)
CREATE DATABASE sports_app;

-- Connect to the database
\c sports_app;

-- Verify connection
SELECT current_database();