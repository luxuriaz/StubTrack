# StubTrack
This is a data visualization project I created in this summer during June. The goal of this project is to record the ticket price
from StubHub and visualize the trend of the price. Since I personally always buy tickets from Stubhub, and the tickets price is
sometimes higher than the original price and sometimes lower than the original price event for the same events depend on
how many days until the events start.
There are two main parts of this project. The first part is to collect data from StubHub's API using a python script. 
The second part is to get and visualize the data on web using javascript, d3 library, and node.js.

## Data Gathering/python
There are basically two steps in the data gathering proccess. First connect to stubhub's api and request the data I need. 
Second Connect to the dynamoDB and store the data in dynamoDB in the form I desired.
I run this script on AWS's EC2 virtual server so that it can constantly gathering data.

## Data visualiztion on Web
I used AWS SDK to connect to dynamoDB and get all the data I colleted. I used javascript to create a list of events I collected so far
and used D3 library to visualize the data to a simple line chart. I used node.js to run the server, I stored AWS Credentials on the server
and used socket.io to establish the connection between front-end and back-end.

## Future Plan
right now I did not do any style work to the website yet. so it looks really ugly right now.
Move the data gathering process on node.js server so that I can further add more feature to the web such as create users and users can
start to record the events they want to see. 
