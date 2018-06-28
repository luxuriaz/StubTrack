var idLocator = [];
document.addEventListener('DOMContentLoaded', function() {
  var eventlist = [];
  AWS.config.update({
    region: "us-east-1",
    // The endpoint should point to the local or remote computer where DynamoDB (downloadable) is running.
    // endpoint: 'http://localhost:8000',
    /*
      accessKeyId and secretAccessKey defaults can be used while using the downloadable version of DynamoDB.
      For security reasons, do not store AWS Credentials in your files. Use Amazon Cognito instead.
    */
    accessKeyId: "AKIAI5FA347D3AKCHAAA",
    secretAccessKey: "pJGKzCu6YFugJk1lumsTOb58kyeqoctolAG+Ko08"
  });

  /*
     Uncomment the following code to configure Amazon Cognito and make sure to
     remove the endpoint, accessKeyId and secretAccessKey specified in the code above.
     Make sure Cognito is available in the DynamoDB web service region (specified above).
     Finally, modify the IdentityPoolId and the RoleArn with your own.
  */
  /*
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: "us-west-2:12345678-1ab2-123a-1234-a12345ab12",
  RoleArn: "arn:aws:iam::123456789012:role/dynamocognito"
  });
  */

  var dynamodb = new AWS.DynamoDB();
  var docClient = new AWS.DynamoDB.DocumentClient();
  var records = [];
  var count = 0;
  var eachinput = '';
  var currentRecord = '';


  function scanData() {
    document.getElementById('RecordedEvents').innerHTML += "Scanning Recorded Event." + "\n";

    var params = {
      TableName: "StubTrackData"
      // ProjectionExpression: "#yr, title, info.rating",
      // FilterExpression: "#yr between :start_yr and :end_yr",
      // ExpressionAttributeNames: {
      //     "#yr": "year",
      // },
      // ExpressionAttributeValues: {
      //     ":start_yr": 1950,
      //     ":end_yr": 1959
      // }
    };

    docClient.scan(params, onScan);


    function onScan(err, data) {
      if (err) {
        document.getElementById('RecordedEvents').innerHTML += "Unable to scan the table: " + "\n" + JSON.stringify(err, undefined, 2);
      } else {
        // Print all the movies
        document.getElementById('RecordedEvents').innerHTML += "Scan succeeded. " + "<br>";
        data.Items.forEach(function(events) {
          count += 1
          // records += events.EventId_Time + ": " + events.Artist + " - current Price: " + events.info.current_price + "\n";
          // get all the recorded events from database
          records.push(events.Artist + " - Location: " + events.info.location + " - Event Time: " + events.info.event_time)
          // document.getElementById('RecordedEvents').innerHTML += count+": " + events.Artist + " - Location: "+events.info.location+ "<br>";
          // document.getElementById('RecordedEvents').innerHTML += events.EventId_Time + ": " + events.Artist + " - current Price: " + events.info.current_price + " - Location: "+events.info.location +" - Recorded date: " +events.info.time+" - Event Time:" + events.info.event_time + " - Remind Times: "+events.info.remind_days+ "<br>";
        });

        var arrayLength = records.length;
        for (var i = 0; i < arrayLength; i++) {
          if (!(eventlist.includes(records[i]))) {
            eventlist.push(records[i])
          }
        }
        var arrayLength = eventlist.length;
        for (var i = 0; i < arrayLength; i++) {
          var eventDiv = document.createElement("div");
          var currentEvent = eventlist[i];
          eventDiv.id = currentEvent;
          eventDiv.class = "Events";
          eventDiv.value = currentEvent
          RecordedEvents.appendChild(eventDiv);
          document.getElementById(currentEvent).innerHTML = currentEvent;
          document.getElementById(currentEvent).onclick = function() {
            document.getElementById("RecordedData").innerHTML = "";


            // console.log("Workworkwork");
            // console.log(this.id);
            idString = this.id;
            var indicIndex = []
            for (var i = 0; i < idString.length; i++) {
              if (idString.charAt(i) == ":") {
                indicIndex.push(i);
              }
            }
            var location = idString.substring(indicIndex[0] + 2, indicIndex[1] - 13);
            var eventTime = idString.substring(indicIndex[1] + 2, idString.length);
            var divId = location + eventTime;

            var dataDiv = document.createElement("div");
            dataDiv.id = divId;
            RecordedData.appendChild(dataDiv);
            // allData.forEach(
            //   if ()
            // )

            var dataList = [];
            var priceList = [];
            var margin = {
                top: 20,
                right: 20,
                bottom: 30,
                left: 50
              },
              width = 960 - margin.left - margin.right,
              height = 500 - margin.top - margin.bottom;
            //create the svg
            var svg = d3.select("#RecordedData").append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");
            data.Items.forEach(function(events) {
              if (location == events.info.location && eventTime == events.info.event_time) {
                // console.log(location,eventTime)
                // console.log(events.info.current_price);
                var remind_time = events.info.time;

                priceList.push(events.info.current_price);
                // if (events.info.remind_days.length > 5){
                //   console.log("Yeaaa");
                //   remind_time = "0";
                // };
                // console.log(events.info.remind_days.length)
                _index = events.EventId_Time.indexOf("_");
                timestamp = events.EventId_Time.substring(_index + 1, events.EventId_Time.length - 7);
                var recordedTime = remind_time + " " + timestamp;
                // var recordedTime = remind_time;
                dataList.push([recordedTime, events.info.current_price]);
                // document.getElementById(divId).innerHTML += events.info.remind_days+" "+ events.info.current_price+"<br>";
                // document.getElementById(divId).innerHTML += events.info.current_price+"<br>";
                // console.log(dataList);
              }
            });
            //set the range
            var x = d3.scaleTime().range([0, width]);
            var y = d3.scaleLinear().range([height, 0]);
            //define the line
            var valueline = d3.line()
              .x(function(d) {
                return x(d.date);
              })
              .y(function(d) {
                return y(d.price);
              });


            //get the data
            var graphData = dataList;

            // format the data
            //             graphData.sort(function(a,b){
            //   // Turn your strings into dates, and then subtract them
            //   // to get a value that is either negative, positive, or zero.
            //   return new Date(b[0].date) - new Date(a[0].date);
            // });
            // console.log("!!!!");
            // console.log(graphData[0]);

            graphData.forEach(function(d) {
              var parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S");
              d.date = parseDate(d[0]);
              // d.date = d[0];
              // console.log(d.date)
              d.price = d[1];
            });


            graphData.sort(function(a, b) {
              var c = a.date;
              var d = b.date;
              return c - d;
            });


            // console.log(d)

            // Scale the range of the data

            x.domain(d3.extent(graphData, function(d) {
              return d.date;
            }));
            var ymin = d3.min(graphData, function(d) {
              return +d.price;
            });
            var ymax = d3.max(graphData, function(d) {
              return +d.price;
            });
            console.log(ymin, ymax)
            y.domain([ymin-10, ymax+10]);

            //Add the valueline path
            svg.append("path")
              .data([graphData])
              .attr("class", "line")
              .attr("d", valueline);

            // Add the X Axis
            svg.append("g")
              .attr("transform", "translate(0," + height + ")")
              .call(d3.axisBottom(x));

            // Add the Y Axis
            svg.append("g")
              .call(d3.axisLeft(y));

          }

        }

      }
      return eventlist;

    }


    // return eventlist;

  }

  scanData();

  // console.log(idLocator[0]);

  // $("#RecordedEvents").click(function(){
  //   alert("YEAAAAAA");
  // }
  // )



}, false);
