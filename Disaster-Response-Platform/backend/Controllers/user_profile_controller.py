from fastapi import APIRouter, HTTPException, Response, Depends, status
from fastapi.security import OAuth2PasswordBearer,OAuth2PasswordRequestForm
from jose import JWTError, jwt
from typing import Optional
from datetime import datetime, timedelta
from Services import authentication
import config
from Database.mongo import MongoDB
from Models import user_model


router = APIRouter()
db = MongoDB.getInstance()
# Secret key to sign and verify the JWT token
SECRET_KEY = config.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

users_collection = MongoDB.get_collection('users')


 


# Login route
@router.post("/token", response_model=user_model.Token)
async def login_for_access_token(user: user_model.User): ##douıble check here
    user = authentication.authenticate_user(users_collection, user.username, user.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = authentication.create_jwt_token(data={"sub": user.username}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}
 
# Protected route
@router.get("/protected")
async def protected_route(current_user: str = Depends(authentication.get_current_user)):
    return {"message": f"Welcome, {current_user}!"}

@router.get("/me/", response_model=user_model.User)
async def read_users_me(current_user: user_model.User = Depends(authentication.get_current_active_user)):
    return current_user


@router.get("/me/items/")
async def read_own_items(current_user: user_model.User = Depends(authentication.get_current_active_user)):
    return [{"item_id": "Foo", "owner": current_user.username}]

@router.post("/signup",)
async def signup(currentUser :user_model.RegisteredUser): #it gets user_collection to inserting
    userDb = db.get_collection("authenticated_user") # get the user collection to make insert operation
    if (userDb.find_one({"username":currentUser.username}) !=None) : #if there is a user already existed with current username
        return {"is_exist":True,"pw_not_ok":False,"phone_not_turkey":False,"registered":False} #return is_exist true as a response
    elif (len(currentUser.password) < 8) : #if username is not existed in db but password contains less than 8 characters
        return {"is_exist":False,"pw_not_ok":True,"phone_not_turkey":False,"registered":False} #return is_exist true as a response
    elif (len(currentUser.phone_number)!= 11 or currentUser.phone_number[:2]!= "05"): #if phone number is not valid
        return {"is_exist":False,"pw_not_ok":False,"phone_not_turkey":True,"registered":False}
    #if password has at least 8 characters and username isn't used by another user, insert it to db
    userDb.insert_one({"username":currentUser.username, "first_name": currentUser.first_name, "last_name": currentUser.last_name, "email":currentUser.email, "phone_number":currentUser.phone_number, "password":currentUser.password})
    print("+9"+currentUser.phone_number)
    # I can send sms to the Verified an Outgoing Caller numbers in my trial account
    # validateNumber("+9"+currentUser.phone_number) #Unable to create record: Sorry! Placing verification calls is not supported on trial accounts. Please upgrade to a full account first 
    # thus I need to add the Verify an Outgoing Caller ID on my trial account first. Please contact me to test them! 
    return {"is_exist":False,"pw_not_ok":False,"phone_not_turkey":False,"registered":True} #when they are set as True, in front end it shows me the warnings as a default so I negate them.
    