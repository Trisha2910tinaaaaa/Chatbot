import motor.motor_asyncio
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "chat_app")

# MongoDB client instance
client = None
db = None

async def get_mongodb():
    """Get MongoDB database instance"""
    global client, db
    if db is None:
        client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
        db = client[DATABASE_NAME]
        
        # Create indexes for better performance
        await db.users.create_index("username", unique=True)
        await db.messages.create_index("session_id")
    
    return db

async def close_mongodb_connection():
    """Close MongoDB connection"""
    global client
    if client:
        client.close()