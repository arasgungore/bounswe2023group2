import json
from http import HTTPStatus
from fastapi import APIRouter, Response, Depends
import Services.authentication_service as authentication_service
from Services.build_API_returns import create_json_for_error
import Services.recurrence_service as recurrence_service
from Models.recurrence_model import *
from typing import List, Optional
from Validations.recurrence_validation import  AttachActivity

router = APIRouter()

@router.post("/", status_code=201)
def create(recurrence: Recurrence, response:Response, current_user: str = Depends(authentication_service.get_current_username)):
    try:
        recurrence_result = recurrence_service.create(recurrence, current_user)
        response.status_code = HTTPStatus.OK
        return recurrence_result
    except ValueError as err:
        err_json = create_json_for_error("RECURRENCE_CREATE_ERROR", str(err))
        response.status_code = HTTPStatus.NOT_FOUND
        return json.loads(err_json)

@router.post("/attach_activity", status_code=200)
def attach(attach: AttachActivity, response:Response, current_user: str = Depends(authentication_service.get_current_username)):
    try:
        attached = recurrence_service.attach_activity(attach, current_user)
        response.status_code = HTTPStatus.OK
        return json.loads(attached)
    except ValueError as err:
        err_json = create_json_for_error("RECURRENCE_CREATE_ERROR", str(err))
        response.status_code = HTTPStatus.NOT_FOUND
        return json.loads(err_json)

@router.get("/{_id}")
def get(_id: str, response:Response):
    try:
        recurrence = recurrence_service.find_one(_id)
        response.status_code = HTTPStatus.OK
        return recurrence
    except ValueError as err:
        err_json = create_json_for_error("Need error", str(err))
        response.status_code = HTTPStatus.NOT_FOUND
        return json.loads(err_json)    
    
@router.get('/start/{_id}')
def start(_id:str, response:Response):
    try:
        recurrences = recurrence_service.start_recurrence(_id)
        response.status_code = HTTPStatus.OK
        return json.loads(recurrences)
    except ValueError as err:
        err_json = create_json_for_error("Need error", str(err))
        response.status_id = HTTPStatus.NOT_FOUND
        return json.loads(err_json)
 
@router.get("/")
def get_all_needs(response:Response):
    try:
        recurrences = recurrence_service.find_many()
        response.status_code = HTTPStatus.OK
        return json.loads(recurrences)
    except ValueError as err:
        err_json = create_json_for_error("Need error", str(err))
        response.status_id = HTTPStatus.NOT_FOUND
        return json.loads(err_json)

@router.get("/cancel/{_id}")
def update_need(_id: str, response:Response):
    try:
        updated_need = recurrence_service.cancel(_id, 'a')
    
        if updated_need:
            response.status_code = HTTPStatus.OK
            return {"needs": [updated_need]}
        else:
            raise ValueError(f"Need id {_id} not updated")
    except ValueError as err:
        err_json = create_json_for_error("Need error", str(err))
        response.status_code = HTTPStatus.NOT_FOUND
        return json.loads(err_json)
    
@router.delete("/{_id}")
def delete_need(_id: str, response:Response):
    try:
        res = recurrence_service.delete(_id)
        response.status_code=HTTPStatus.OK
        return json.loads(res)
        
    except ValueError as err:
        err_json = create_json_for_error("Need delete error", str(err))
        response.status_code = HTTPStatus.NOT_FOUND
        return json.loads(err_json)    

@router.get("/resume/{_id}")
def resume(_id: str, response:Response):
    try:
        res = recurrence_service.resume(_id, 'a')
        response.status_code=HTTPStatus.OK
        return json.loads(res)
        
    except ValueError as err:
        err_json = create_json_for_error("Reccurence resume error", str(err))
        response.status_code = HTTPStatus.NOT_FOUND
        return json.loads(err_json)    
