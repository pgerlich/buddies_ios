
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

Parse.Cloud.beforeSave("Jobs", function(request, response) {

	switch(request.object.get("status")){
		case 0:
			//Push notification to everyone for new job
			sendPushNotification('allEmplyees', 'A new job is available in your area.');
			break;
		case 1:
			// Push notification to user for claimed job
			getUserAndSendNotification(request.object, 'Someone has claimed your car wash request!');
			break;	
		case 2:
			// Push notification to user for completed job
			getUserAndSendNotification(request.object, 'Your car wash is complete!');
			break;

	}

    response.success();
});

function getUserAndSendNotification(job, message){
    var query = new Parse.Query(Parse.User);
    query.whereEqualTo('objectId', job.get('customer'));

    query.find({
        success: function (results) {
            var userInstallId = results[0].get('installId');
			sendPushNotification(userInstallId, message);
        },
        error: function (error) {

        }
    });
}

function sendPushNotification(installationId, message){
	var query = new Parse.Query(Parse.Installation);

	if ( installationId != 'allEmployees') {
		query.equalTo("installationId", installationId);
	} else {
		query.equalTo("installationId", ['employee']);
	}

	Parse.Push.send({
	  where: query, // Set our Installation query
	  data: {
	    alert: message
	  }
	}, {
	  success: function() {
	    // Push was successful
	  },
	  error: function(error) {
	    // Handle error
	  }
	});
}
