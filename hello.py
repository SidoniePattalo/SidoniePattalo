from __future__ import print_function
from flask import Flask
from flask import make_response

import pickle
import os.path
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

app = Flask(__name__)

# The ID and range of a sample spreadsheet.
SAMPLE_SPREADSHEET_ID = '1Fn9w47wZ1E-fJ8S4GCon7n2sjH-DjH6OKaop6EEmkqE'
SAMPLE_RANGE_NAME = 'Class Data!A2:E'

SPREADSHEET_ID = "1Fn9w47wZ1E-fJ8S4GCon7n2sjH-DjH6OKaop6EEmkqE"
API_KEY = "AIzaSyDyDXCY04HC_vH0VpB5KOT2hba8w1crrhI"
CLIENT_ID = "587671854360-5b2mppi4vhmr7el8i46t9mkam6fk5vug.apps.googleusercontent.com"
CLIENT_KEY = "FXYzrEDkvLX_xWDF8a4G8UrO"
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"]

def main():
    """Shows basic usage of the Sheets API.
    Prints values from a sample spreadsheet.
    """
    creds = None
    # The file token.pickle stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)

    service = build('sheets', 'v4', credentials=creds)

    # Call the Sheets API
    sheet = service.spreadsheets()
    result = sheet.values().get(spreadsheetId=SPREADSHEET_ID).execute()
    values = result.get('values', [])

    if not values:
        print('No data found.')
    else:
        print(values)



@app.route('/')
def home():
    return "Hello World!"
@app.route('/<page_name>')
def other_page(page_name):
    response = make_response('The page named %s does not exist.' \
                             % page_name, 404)
    return response
""" if __name__ == '__main__':
    app.run(debug=True) """

if __name__ == '__main__':
    main()
