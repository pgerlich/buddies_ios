
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

Parse.Cloud.beforeSave("Jobs", function(request, response) {

	switch(request.object.get("status")){
		case 0:
			//Push notification to everyone for new job
			break;
		case 1:
			// Push notification to user for claimed job
			break;
		case 2:
			// Push notification to user for completed job
			break;

	}

    response.success();
 
});