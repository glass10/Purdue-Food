var https = require('https')

exports.handler = (event, context) => {

  try {

    if (event.session.new) {
      // New Session
      console.log("NEW SESSION")
    }

    switch (event.request.type) {

      case "LaunchRequest":
        // Launch Request
        console.log(`LAUNCH REQUEST`)
        context.succeed(
          generateResponse(
            buildSpeechletResponse("Welcome to Purdue Food. How may I help you?", false),
            {}
          )
        )
        break;

      case "IntentRequest":
        // Intent Request
        console.log(`INTENT REQUEST`)

        switch(event.request.intent.name) {
          case "mealReq":
            var court = event.request.intent.slots.Court.value;
            var date = event.request.intent.slots.Date.value;
            var meal = event.request.intent.slots.Meal.value;


            //Today's Information
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth()+1; //January is 0!
            var yyyy = today.getFullYear();
            var hours = today.getHours() - 4; //Eastern Standard Time
            var mins = today.getMinutes();
            var secs = today.getSeconds();
            console.log(hours);
            if(dd<10) {
                dd='0'+dd
            } 
            if(mm<10) {
                mm='0'+mm
            } 
            today = mm+'-'+dd+'-'+yyyy;

            //Handling empty values
            if(court === "" || court === undefined){
              court = 'Ford';
            }
            else if(court !== "Ford" && court !== "Wiley" && court !== "Earhart" && court !== "Hillenbrand" && court !== "Windsor"){
              if(court[0] === 'f' || court[0] === 'F'){
                court = "Ford";
              }
              else if(court[0] === 'e' || court[0] === 'E'){
                court = "Earhart";
              }
              else if(court[0] === 'h' || court[0] === 'H'){
                court = "Hillenbrand";
              }
              else if(court[2] === 'l' || court[2] === 'L'){
                court = "Wiley";
              }
              else{
                court = "Windsor";
              }
            }


            if(date === "" || date === undefined){
              date = today;
            }
            if(meal === "" || meal === undefined){
              if(hours < 11){
                meal = "Breakfast"
              }
              if(hours >= 11 && hours < 5){
                meal = "Lunch"
              }
              else{
                meal = "Dinner"
              }
            }

            console.log("Court: " + court);
            console.log("Meal: " + meal);
            console.log("Date: " + date);


            //Getting Dining Info
          var pathOptions = court + "/" + date;
          var get_options = {
              host: 'api.hfs.purdue.edu',
              path: '/menus/v1/locations/'+pathOptions,
              method: 'GET',
			    };

          //GETTING INFO FROM DATABASE
          https.get(get_options, function(res){
                  console.log("STATUS: " +res.statusCode);
                      body = '';
                      res.on('data', function(chunk) {
                          body += chunk;
                      });
                      res.on('end', function() {
                          try {
                              //Use Info Here
                              var food = JSON.parse(body);
                              console.log(food);
                              var breakfast = food.Breakfast[0].Items;
                              //console.log(breakfast);

                              var allFood = [];

                              if(meal === "breakfast" || meal === "Breakfast"){
                                for(var i = 0; i < food.Breakfast.length; i++){
                                  for(var j = 0; j < food.Breakfast[i].Items.length; j++){
                                    allFood.push(food.Breakfast[i].Items[j].Name);
                                  }
                                }
                              }
                              else if(meal === "lunch" || meal === "Lunch"){
                                for(var i = 0; i < food.Lunch.length; i++){
                                  for(var j = 0; j < food.Lunch[i].Items.length; j++){
                                    allFood.push(food.Lunch[i].Items[j].Name);
                                  }
                                }
                              }
                              else if(meal === "dinner" || meal === "Dinner"){
                                for(var i = 0; i < food.Dinner.length; i++){
                                  for(var j = 0; j < food.Dinner[i].Items.length; j++){
                                    allFood.push(food.Dinner[i].Items[j].Name);
                                  }
                                }
                              }

                              console.log(allFood);
                              if(allFood.length === 0){
                                context.succeed(
                                    generateResponse(
                                        buildSpeechletResponse("I don't see any meal info for " + meal + " at " + court + " on " + date + ". It could be closed!", true),
                                        {}
                                    )
                                )
                              }
                              else{
                                var formattedResponse = "Your options for food at " + court + " for " + meal + " on " + date + " are: ";
                                for(var i = 0; i < allFood.length; i++){
                                  var foodItem = allFood[i] + ", ";
                                  formattedResponse += foodItem;
                                }

                                context.succeed(
                                    generateResponse(
                                        buildSpeechletResponse(formattedResponse, true),
                                        {}
                                    )
                                )
                              }

                              
                  
                          } catch (e) {
                              console.log('Error parsing JSON!');
                              context.succeed(
                                  generateResponse(
                                      buildSpeechletResponseAccount("", true),
                                      {}
                                  )
                              )
                          }	
                      })
                      res.on('error', function(e) {
                      console.log("Got error: " + e.message);
                });
          });
            break;

            case "AMAZON.HelpIntent":
                console.log('HELP REQUEST');
                context.succeed(
                    generateResponse(
                        buildSpeechletResponse('', false),
                        {}
                    )
                )
            break;
            
            case "AMAZON.CancelIntent":
                console.log('HELP REQUEST');
                context.succeed(
                    generateResponse(
                        buildSpeechletResponse('', true),
                        {}
                    )
                )
            break;
            
            case "AMAZON.StopIntent":
                console.log('HELP REQUEST');
                context.succeed(
                    generateResponse(
                        buildSpeechletResponse('', true),
                        {}
                    )
                )
            break;

          default:
            throw "Invalid intent"
        }

        break;

      case "SessionEndedRequest":
        // Session Ended Request
        console.log(`SESSION ENDED REQUEST`)
        break;

      default:
        context.fail(`INVALID REQUEST TYPE: ${event.request.type}`)

    }

  } catch(error) { context.fail(`Exception: ${error}`) }

}



// Helpers
buildSpeechletResponse = (outputText, shouldEndSession) => {

  return {
    outputSpeech: {
      type: "PlainText",
      text: outputText
    },
    shouldEndSession: shouldEndSession
  }

}

generateResponse = (speechletResponse, sessionAttributes) => {

  return {
    version: "1.0",
    sessionAttributes: sessionAttributes,
    response: speechletResponse
  }

}