import json
from fastapi import APIRouter, Path
import firebase_admin
from firebase_admin import initialize_app, credentials, firestore, messaging
from pydantic import BaseModel
import requests
from fastapi.middleware.cors import CORSMiddleware
from config import Config
from google.oauth2 import service_account
import google.auth.transport.requests

router = APIRouter()
cred= credentials.Certificate(Config.FCM_CREDENTIALS)
firebase_admin.initialize_app(cred)

class Subscription(BaseModel):
    token: str
    topic: str
class Notification(BaseModel):
    topic: str
    title: str
    body: str
    
def _get_access_token():

  credentials = service_account.Credentials.from_service_account_file(Config.FCM_CREDENTIALS, scopes=["https://www.googleapis.com/auth/firebase.messaging", "https://www.googleapis.com/auth/cloud-platform"])
  request = google.auth.transport.requests.Request()
  credentials.refresh(request)
  print("bearer:" , credentials.token)
  return credentials.token

@router.get("/", )
async def read_users():
    return [{"message": "This is notifications"}]


# API Endpoints
@router.post("/subscriptions")
async def create_subscription(subscription: Subscription):
    # Save subscription to Firebase
    print(subscription.token)
    response = messaging.subscribe_to_topic(subscription.token, subscription.topic)
    
    print(response.success_count , 'tokens were subscribed successfully')

@router.post("/unsubscribe")
async def unsubscription(subscription: Subscription):

    response = messaging.unsubscribe_from_topic(subscription.token, subscription.topic)

    print(response.success_count, 'tokens were unsubscribed successfully')




@router.get("/subscriptions/{user_id}")
async def get_subscriptions(user_id: str):

    return {"subscriptions": subscriptions}

@router.get("/topics")
async def get_topics():
    # Retrieve subscriptions from Firebase
    return {"topic": "Food"}, {"topic": "Driver"}

@router.get("/client/{device_token}", summary="DeviceInfo")
async def get_client_info(device_token: str = Path()):
        # Retrieve subscriptions from Firebase
    url = "https://iid.googleapis.com/iid/info/cEbBEPEeA-azup7T4MDjcv:APA91bHUedv4Li2zvbaz-ZUNerZS3CHtRkwUhZ4IVQ6l6V8zDWGJ8cu50OUvtlhe4cJKQs63nLZr5W68QcGq3U7lJlSHIpW6QlfqjTjRSXezXNsVkll-om_G-YzMvyc643nyzQkUSpeQ"
    payload = {}
    headers = {
    'Authorization': Config.FCM_AUTHORIZATION_KEY
    }
    response = requests.get(url, headers=headers, data=payload)

    print(response.text)
    return response


# Simulating event creation
@router.post("/send_notification")
async def send_notif(notification:Notification):
    print(notification)
    url = "https://fcm.googleapis.com/fcm/send"
    payload = json.dumps({
        "to": Config.MY_FCM_KEY ,
        "notification": {
        "body": notification.body,
        "OrganizationId": "2",
        "content_available": True,
        "priority": "high",
        "title": notification.title
        }
        })
    headers = {
    'Content-Type': 'application/json',
    'Authorization': Config.FCM_AUTHORIZATION_KEY
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    print(response.text)
    return response


topic_notif_responses=[]
# Simulating event creation
@router.post("/create_event")
async def create_event(notification:Notification):
    print("before")
    url = "https://fcm.googleapis.com//v1/projects/{}/messages:send".format(Config.FCM_PROJECT_ID)
    bearer_token=_get_access_token()
    print(notification.topic,notification.title, notification.body )
    payload = json.dumps({
    "message": {
        "topic": notification.topic,
        "notification": {
        "title": notification.title,
        "body": notification.body
        },
        "webpush": {
        "fcm_options": {
            "link": "https://b645-193-140-194-16.ngrok-free.app/notifications"
        }
        }
    }
    })
    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer {}'.format(bearer_token)
    }  
    response = requests.request("POST", url, headers=headers, data=payload)
    topic_notif_responses.append(response.text)
    print(response.text)
    return response.text

@router.get("/create_event")
async def send_notif():
    json_list = [json.loads(item) for item in topic_notif_responses]
    return json_list
