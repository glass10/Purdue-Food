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
            context.succeed(
                generateResponse(
                    buildSpeechletResponse('The values I heard were: ' + court + ", " + meal + ", and " + date, true),
                    {}
                )
            )

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