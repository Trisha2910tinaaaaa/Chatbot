from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import List, Optional
import os
from dotenv import load_dotenv
import asyncio
import json
from datetime import datetime

from database import get_mongodb, close_mongodb_connection
from models import User, ChatSession, Message, UserCreate, UserLogin, ChatMessage, SessionCreate
from utils import get_llm, verify_password, get_password_hash, create_access_token, get_current_user

# Load environment variables
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Validate API keys
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY is missing. Set it in environment variables.")

# Initialize FastAPI app
app = FastAPI(
    title="Chat Application API",
    description="API for a ChatGPT-like application using FastAPI and MongoDB",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Events to handle MongoDB connection
@app.on_event("startup")
async def startup_db_client():
    await get_mongodb()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongodb_connection()

@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "online", 
        "message": "Chat Application API is running",
        "version": "1.0.0"
    }

@app.post("/register", tags=["Authentication"])
async def register_user(user_data: UserCreate):
    """Register a new user"""
    db = await get_mongodb()
    
    # Check if user already exists
    existing_user = await db.users.find_one({"username": user_data.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Create new user with hashed password
    hashed_password = get_password_hash(user_data.password)
    user = {
        "username": user_data.username,
        "email": user_data.email,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(user)
    
    # Create access token
    access_token = create_access_token(data={"sub": user_data.username})
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_id": str(result.inserted_id)
    }

@app.post("/login", tags=["Authentication"])
async def login_user(user_data: UserLogin):
    """Login a user"""
    db = await get_mongodb()
    
    # Find user
    user = await db.users.find_one({"username": user_data.username})
    if not user or not verify_password(user_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    # Create access token
    access_token = create_access_token(data={"sub": user_data.username})
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_id": str(user["_id"])
    }

@app.post("/sessions", tags=["Sessions"])
async def create_session(session_data: SessionCreate, current_user: User = Depends(get_current_user)):
    """Create a new chat session"""
    db = await get_mongodb()
    
    session = {
        "user_id": str(current_user["_id"]),
        "title": session_data.title,
        "created_at": datetime.utcnow(),
        "last_activity": datetime.utcnow()
    }
    
    result = await db.chat_sessions.insert_one(session)
    
    return {
        "session_id": str(result.inserted_id),
        "title": session_data.title,
        "created_at": session["created_at"]
    }

@app.get("/sessions", tags=["Sessions"])
async def get_sessions(current_user: User = Depends(get_current_user)):
    """Get all chat sessions for a user"""
    db = await get_mongodb()
    
    cursor = db.chat_sessions.find({"user_id": str(current_user["_id"])})
    sessions = await cursor.to_list(length=100)
    
    # Convert ObjectId to string
    for session in sessions:
        session["_id"] = str(session["_id"])
    
    return sessions

@app.post("/chat", response_model=ChatMessage, tags=["Chat"])
async def chat(message: ChatMessage, current_user: User = Depends(get_current_user)):
    """Send a message and get a response"""
    db = await get_mongodb()
    
    # Verify session exists and belongs to user
    session = await db.chat_sessions.find_one({
        "_id": message.session_id,
        "user_id": str(current_user["_id"])
    })
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Save user message
    user_message = {
        "session_id": message.session_id,
        "content": message.content,
        "role": "user",
        "timestamp": datetime.utcnow()
    }
    
    await db.messages.insert_one(user_message)
    
    # Update session last activity
    await db.chat_sessions.update_one(
        {"_id": message.session_id},
        {"$set": {"last_activity": datetime.utcnow()}}
    )
    
    # Get conversation history for context
    cursor = db.messages.find({"session_id": message.session_id}).sort("timestamp", 1)
    history = await cursor.to_list(length=50)  # Limit to last 50 messages
    
    # Format messages for LLM
    formatted_messages = []
    for msg in history:
        formatted_messages.append({
            "role": msg["role"],
            "content": msg["content"]
        })
    
    # Get response from LLM
    llm = get_llm()
    response = await llm.ainvoke(formatted_messages[-10:])  # Send last 10 messages for context
    
    # Save assistant message
    assistant_message = {
        "session_id": message.session_id,
        "content": response.content,
        "role": "assistant",
        "timestamp": datetime.utcnow()
    }
    
    await db.messages.insert_one(assistant_message)
    
    return ChatMessage(
        session_id=message.session_id,
        content=response.content,
        role="assistant"
    )

@app.post("/chat/stream", tags=["Chat"])
async def chat_stream(message: ChatMessage, current_user: User = Depends(get_current_user)):
    """Send a message and get a streaming response"""
    db = await get_mongodb()
    
    # Verify session exists and belongs to user
    session = await db.chat_sessions.find_one({
        "_id": message.session_id,
        "user_id": str(current_user["_id"])
    })
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Save user message
    user_message = {
        "session_id": message.session_id,
        "content": message.content,
        "role": "user",
        "timestamp": datetime.utcnow()
    }
    
    await db.messages.insert_one(user_message)
    
    # Update session last activity
    await db.chat_sessions.update_one(
        {"_id": message.session_id},
        {"$set": {"last_activity": datetime.utcnow()}}
    )
    
    # Get conversation history for context
    cursor = db.messages.find({"session_id": message.session_id}).sort("timestamp", 1)
    history = await cursor.to_list(length=50)  # Limit to last 50 messages
    
    # Format messages for LLM
    formatted_messages = []
    for msg in history:
        formatted_messages.append({
            "role": msg["role"],
            "content": msg["content"]
        })
    
    # Create streaming response
    async def response_stream():
        llm = get_llm()
        
        full_response = ""
        async for chunk in llm.astream_chat(formatted_messages[-10:]):  # Send last 10 messages for context
            if chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                full_response += content
                yield f"data: {json.dumps({'content': content})}\n\n"
                await asyncio.sleep(0)
        
        # Save the complete response
        assistant_message = {
            "session_id": message.session_id,
            "content": full_response,
            "role": "assistant",
            "timestamp": datetime.utcnow()
        }
        
        await db.messages.insert_one(assistant_message)
        yield f"data: {json.dumps({'content': '[DONE]'})}\n\n"
    
    return StreamingResponse(response_stream(), media_type="text/event-stream")

@app.get("/history/{session_id}", tags=["Chat"])
async def get_history(session_id: str, current_user: User = Depends(get_current_user)):
    """Get message history for a session"""
    db = await get_mongodb()
    
    # Verify session exists and belongs to user
    session = await db.chat_sessions.find_one({
        "_id": session_id,
        "user_id": str(current_user["_id"])
    })
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Get messages
    cursor = db.messages.find({"session_id": session_id}).sort("timestamp", 1)
    messages = await cursor.to_list(length=1000)
    
    # Convert ObjectId to string
    for message in messages:
        message["_id"] = str(message["_id"])
    
    return messages

# Main execution
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)