import boto3
import requests
import base64
import pprint
import datetime
import sched, time

# connect to API
def stubhub(event_name,location,eventid,year,month,date,file_name):
    ## Enter user's API key, secret, and Stubhub login
    app_token = "2e55a526-a5f5-3986-a1e5-0dbbe540aee6"
    consumer_key = "Z5EPKHnk2l4Q8v8Xmr7XdzyOlCga"
    consumer_secret = "ct_vAT6fvfdOWEuWrcMNAWN0fWIa"
    stubhub_username = "zdbhxc2010@gmail.com"
    stubhub_password = "Zszdwdzh1995!"

    combo = consumer_key + ':' + consumer_secret
    basic_authorization_token = base64.b64encode(combo.encode('utf-8'))
    url = 'https://api.stubhub.com/login'
    headers = {
            'Content-Type':'application/x-www-form-urlencoded',
            'Authorization':'Basic '+(basic_authorization_token),}
    body = {
            'grant_type':'password',
            'username':stubhub_username,
            'password':stubhub_password,
            'scope':'PRODUCTION'}

    r = requests.post(url, headers=headers, data=body)
    print (r)

    token_response = r.json()
    access_token = token_response['access_token']
    # print access_token
    user_GUID = r.headers['X-StubHub-User-GUID']

    inventory_url = 'https://api.stubhub.com/search/inventory/v2'

    data = {'eventid':eventid, 'rows':200}
    headers['Authorization'] = 'Bearer ' + access_token
    headers['Accept'] = 'application/json'
    headers['Accept-Encoding'] = 'application/json'

    inventory = requests.get(inventory_url, headers=headers, params=data)
    inv = inventory.json()
    # print inv
    # print inv['totalListings']
    # for item in inv['totalListings']:
    for item in inv['listing']:
        if item['ticketSplit']=="1":
            # since the lowest price comes first, we just use the frist we find, and it is the lowest price of now.
            current_lowestprice = (item['currentPrice']['amount'])
            break
    print current_lowestprice

    # create the date and time
    event_time = datetime.date(year,month,date)
    # print event_time
    event_start_time = "23:59:59"
    #set event start time default at 8 pm EST.
    time = datetime.datetime.now()
    timestamp = str(time.time())
    year_now = time.year
    month_now = time.month
    day_now = time.day
    hour_now = time.hour
    minute_now = time.minute
    second_now = time.second
    # freq = 1200 # sleep for twenty minutes
    if len(str(minute_now)) == 1:
        minute_now = "0"+str(minute_now)
        #if single digit add 0 infront
    time = datetime.date(year_now,month_now,day_now)
    #assume track in the same year
    remind_days = event_time-time
    print remind_days
    if int(str(remind_days)[0])>0:
        print ("event happens after more than 1 day")
        # freq = 3600
        remind_days = str(remind_days)
        for i in range(len(remind_days)):
            if remind_days[i] == "d":
                remind_days = remind_days[:(i-1)]
                break

        # if more than one day before the event start, write the price every hour
        current_time_difference = ("Current time: " + str(time)+" " + str(hour_now) +":"+str(minute_now)+" Current time difference: " + str(remind_days)+" days")
        print current_time_difference
        # write into database
        time = str(time)
        DynamoDB(event_name, event_time, time, remind_days, current_lowestprice,eventid,location,timestamp)
        # write into text file

        f = open(file_name, 'a')
        f.write(str(current_lowestprice)+"\n")
        f.write(current_time_difference+"\n")
        f.close()
        # return [return_statement,freq]

    else:
        print ("event happens less than 1 day")
        # freq = 600
        remind_days = 0
        current_time_hour_minute = str(hour_now)+":"+str(minute_now)+":"+str(second_now)
        # if the event happens today, write the price every ten minutes
        time_format = '%H:%M:%S'
        time_difference = datetime.datetime.strptime(event_start_time, time_format) - datetime.datetime.strptime(current_time_hour_minute, time_format)
        print (str(time_difference))
        if str(time_difference)[0]== "-":
            print "event ended"
            return
        current_time_difference = ("Current time: " + str(time)+" " + str(hour_now) +":"+str(minute_now)+" Current time difference: " + str(time_difference))
        print current_time_difference
        # write into database
        time = str(time)
        DynamoDB(event_name, event_time, time, time_difference, current_lowestprice,eventid,location,timestamp)
        # write into text file
        f = open(file_name, 'a')
        f.write(str(current_lowestprice)+"\n")
        f.write(current_time_difference+"\n")
        f.close()
        # return [return_statement,freq]

# store data in local data base

def DynamoDB(event_name, event_time, time, remind_days, current_price, event_id,location,timestamp):
    dynamodb = boto3.resource('dynamodb',region_name='us-east-1')

    table = dynamodb.Table('StubTrackData')

    response = table.put_item(
       Item={
            'EventId_Time': event_id+'_'+timestamp,
            'Artist': event_name,
            'info': {
                'event_name':event_name,
                'location':location,
                'event_time': str(event_time),
                'time': str(time),
                'remind_days':str(remind_days),
                'current_price':str(current_price)

            }
        }
    )



while True:

    # stubhub(event_name="Above & Beyond",location="LA Huntington State Beach Park",eventid = '103538110',year=2018,month=6,date=23,file_name = "Above & Beyond LA Huntington State Beach Park 06-23.txt")
    # stubhub(event_name="Chainsmokers",location="PA Fillmore",eventid = '103597542',year=2018,month=6,date=20,file_name = "Chainsmokers PA Fillmore 06-20.txt")
    stubhub(event_name="Kaskade",location="Atlantic City Ocean Resort HQ2 Nightclub",eventid = '103641666',year=2018,month=6,date=30,file_name = "Kaskade Atlantic City Ocean Resort HQ2 Nightclub 06-30.txt")
    stubhub(event_name="Diplo",location="Atlantic City Ocean Resort HQ2 Nightclub",eventid = '103661710',year=2018,month=6,date=29,file_name = "Diplo Atlantic City Ocean Resort HQ2 Nightclub 06-29.txt")
    # stubhub(event_name="Steve Aoki",location="Brooklyn Mirage",eventid = '103575739',year=2018,month=6,date=10,file_name = "Steve Aoki Brooklyn Mirage 06-10.txt")
    # stubhub(event_name="Hardwell",location="Brooklyn Mirage",eventid = '103533790',year=2018,month=6,date=23,file_name = "Hardwell Brooklyn Mirage 06-23.txt")
    # stubhub(event_name="Spring Awakening",location="Chicago",eventid = '103366449',year=2018,month=6,date=8,file_name = "Spring Awakening Chicago 06-08.txt")
    stubhub(event_name="Zedd",location="LA State Historic Park",eventid = '103607535',year=2018,month=7,date=3,file_name = "Zedd LA State Historic Park 07-03.txt")
    # stubhub(event_name="Steve Aoki DC",eventid = '103360040',year=2018,month=2,date=10,file_name = "Steve Aoki DC 02-10.txt")

    time.sleep(3600)
