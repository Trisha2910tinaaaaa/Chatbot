from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId

# Pydantic models for request/response
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

# User Models
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class User(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id")
    username: str
    email: EmailStr
    created_at: datetime

    class Config:
        json_encoders = {
            ObjectId: str
        }

# Chat Session Models
class SessionCreate(BaseModel):
    title: str = "New Chat"

class ChatSession(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id")
    user_id: str
    title: str
    created_at: datetime
    last_activity: datetime

    class Config:
        json_encoders = {
            ObjectId: str
        }

# Message Models
class ChatMessage(BaseModel):
    session_id: str
    content: str
    role: str = "user"  # "user" or "assistant"

class Message(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id")
    session_id: str
    content: str
    role: str  # "user" or "assistant"
    timestamp: datetime

    class Config:
        json_encoders = {
            ObjectId: str
        }