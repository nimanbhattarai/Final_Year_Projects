# Scholarly Backend

## MongoDB Configuration

To ensure student data and other information is properly stored in MongoDB, follow these setup instructions:

1. Make sure you have a `.env` file in the backend folder with the following MongoDB configuration:

```
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGO_USERNAME=your_mongodb_username
MONGO_PASSWORD=your_mongodb_password
MONGO_DB_NAME=ScholarlyDb  # This is important - use this exact name or update it

# Other necessary config
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
FRONTEND_URL=http://localhost:5173
```

2. Replace `your_mongodb_username` and `your_mongodb_password` with your actual MongoDB Atlas credentials.

3. Make sure your MongoDB cluster is correctly configured and accessible.

## Troubleshooting Data Storage Issues

If student data is not being stored properly:

1. Check the console output for MongoDB connection errors
2. Verify your MongoDB Atlas credentials are correct
3. Ensure your IP address is whitelisted in MongoDB Atlas
4. Confirm that the database name in your connection string matches `MONGO_DB_NAME` in your .env file
5. Make sure your MongoDB cluster is running and accessible

## Running the Server

```
npm install
npm start
```

The server should run on port 5000 by default. 