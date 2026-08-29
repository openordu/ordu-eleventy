# Use an official Node.js runtime as a parent image
FROM node:16-alpine AS build

# Set the working directory
WORKDIR /usr/src/app

# Install git
RUN apk add --no-cache git

# Copy the rest of the application code
COPY . .

# Install any needed packages specified in package.json
RUN npm install

# Install Eleventy globally
RUN npm install -g @11ty/eleventy

# Install glup
RUN npm install -g gulp

# Define environment variable for Eleventy
ENV ELEVENTY_ENV=production

# Build the Eleventy site
RUN eleventy

# Generate images and CSS (GAF-276: tailwind owns theme.min.css — run it FIRST)
RUN gulp dist-assets && gulp tailwind && gulp sass

# Use an official Node.js runtime as a parent image
FROM node:16-alpine

# Copy the built Eleventy site from the previous image
COPY --from=build /usr/src/app/dev /usr/src/app/dev

RUN mv /usr/src/app/dev /usr/src/app/_site

# Set the working directory
WORKDIR /usr/src/app/_site

# Install http-server
RUN npm install http-server -g

# Set the env var for port(not used)
ENV PORT=8080

# Expose port 8080 to the outside world
EXPOSE 8080

# Start Eleventy server
CMD ["http-server", "./", "-p=8080"]
