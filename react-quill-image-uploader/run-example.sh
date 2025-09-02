#!/bin/bash

echo "Installing dependencies for react-quill-image-uploader..."
npm install

echo "Setting up the example app..."
cd example
npm install

echo "Starting the example app..."
npm start 