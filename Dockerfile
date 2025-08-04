# Use Node.js base image
FROM node:18-alpine

# Install Python and pip
RUN apk add --no-cache python3 py3-pip

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY requirements.txt ./

# Install Node.js dependencies
RUN npm install --legacy-peer-deps

# Create and activate Python virtual environment
RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"

# Install Python dependencies in virtual environment
RUN /app/venv/bin/pip install -r requirements.txt

# Copy source code
COPY . .

# Build the Next.js app
RUN npm run build

# Expose ports for all services
EXPOSE 3000 5000 5001

# Start command (Railway will override this)
CMD ["npm", "start"] 