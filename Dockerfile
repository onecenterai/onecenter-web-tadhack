# Use an official lightweight Node.js image
FROM node:14-alpine

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any necessary dependencies
RUN npm install express

# Expose port 3000 for the app
EXPOSE 3000

# Start the app from app-index.html not app-guide-content.html
CMD ["node", "-e", "const express = require('express'); const app = express(); app.get('/', (req, res) => res.sendFile('/app-index.html', { root: __dirname })); app.listen(3000, () => console.log('App listening on port 3000!'));"]
