from pydantic import BaseModel, Field
from typing import Dict, Any
from enum import Enum
import datetime

class ConditionEnum(str, Enum):
    new = "new"
    used = "used"

class Resource(BaseModel):
    _id: str = Field(default=None)
    created_by: str = Field(default=None)
    description: str = Field(default=None)
    condition: ConditionEnum = Field(default=None)
    initialQuantity: int = Field(default=None)
    currentQuantity: int = Field(default=None)
    type: str = Field(default=None)
    details: Dict[str, Any] = Field(default=None)
    recurrence_id: str = Field(default=None)
    recurrence_rate: str = Field(default=None)
    recurrence_deadline: datetime.date = Field(default=None)
    x: float = Field(default=0.0)
    y: float = Field(default=0.0)
    active: bool = Field(default=True)
    occur_at: datetime.date = Field(default_factory=datetime.date.today)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.now)
    last_updated_at: datetime.datetime = Field(default_factory=datetime.datetime.now)
    upvote: int = Field(default=0)
    downvote: int = Field(default=0)
    
# Update Body Models
class QuantityUpdate(BaseModel):
    quantity: int

class ConditionUpdate(BaseModel):
    condition: ConditionEnum
