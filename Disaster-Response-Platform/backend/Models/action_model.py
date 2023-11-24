from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
from enum import Enum
from Models.resource_model import *
from Models.need_model import *

class statusEnum(str, Enum):
    created="Created"
    active= "Active"
    inactive= "Cancelled"

class ActionType(str,Enum):
    moving="Moving" #resource ya da need taşımak
    search_for_survivors="Search for survivors"
    dispatch_of_a_relief_team="dispatch of a relief team"
    need_resource="need_resource"

class ActionGroup(BaseModel):
    related_needs: Optional[List[str]]
    related_resources: Optional[List[str]]
    
class Action(BaseModel):
    _id: str = Field(default=None)
    created_by: str = Field(default=None)
    description: str = Field(default=None)
    type: ActionType= None
    start_location_x: float = Field(default=0.0)
    start_location_y: float = Field(default=0.0)
    endLocation_x: float = Field(default=0.0)
    endLocation_y: float = Field(default=0.0)
    status: statusEnum = Field(statusEnum.created)
    occur_at: datetime.datetime = Field(default_factory=datetime.datetime.now)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.now)
    last_updated_at: datetime.datetime = Field(default_factory=datetime.datetime.now)
    upvote: int = Field(default=0)
    downvote: int = Field(default=0)
    related_groups: Optional[List[ActionGroup]]= None
 
    end_at: datetime.datetime = Field(default_factory=datetime.datetime.now) #recurrence ise, girilen date min(resource, need) den büyük ise user a action bilgisi tarih içererek dönülür
   





class ActionSuccess(BaseModel):
    action_id: str

class ActivityInfo(BaseModel):
    text: str

class AllActionsResponse(BaseModel):
    notsure: str

class updateResponse(BaseModel):
    actions: List[Action]