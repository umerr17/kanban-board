# 1. Grab a lightweight Linux environment with Node 18 pre-installed
FROM node:22-alpine

# 2. Create a folder inside that container to work out of
WORKDIR /usr/src/app

# 3. Copy only the package files first
COPY package*.json ./

# 4. Install dependencies inside the container
RUN npm install

# 5. Copy the rest of your application code
COPY . .

# 6. Document the port your Express app uses
EXPOSE 5000

# 7. Start the server when the container boots
CMD ["node", "server.js"]