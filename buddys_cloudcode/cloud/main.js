// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function (request, response) {
    response.success("Hello world!");
});

/**
 * Notify appropriate person when
 */
Parse.Cloud.afterSave("Jobs", function (request, response) {

    Parse.Cloud.httpRequest({
        method: "POST",
        url: "https://api.parse.com/1/jobs/sendPushNotifications",
        headers: {
            "X-Parse-Application-Id": "Nw7LzDSBThSKyvym6Q7TwDWcRcz44aOddL75efLL",
            "X-Parse-Master-Key": "XX3j68kZmirv3k2rQRuhmDaXFi3OQZg0KmRMUYJ8",
            "Content-Type": "application/json"
        },
        body: {
            status: request.object.get('status'),
            employee: request.object.get('employee'),
            customer: request.object.get("customer")
        },
        success: function(httpResponse) {

        },
        error: function(error) {

        }
    });


});

Parse.Cloud.job("sendPushNotifications", function(request, status) {
    // Set up to modify user data
    Parse.Cloud.useMasterKey();

    var maxCount = 0;
    var runningCount = 0;

    switch (request.params.status) {

        case 0:
            //Push notification to everyone for new job
            notifyEmployeesOfNewJob('A new job is available in your area.');
            break;
        case 1:
            // Push notification to user for claimed job
            sendEmailAndNotificationToUserViaId(request.params.customer.objectId, 'Someone has claimed your car wash request!');
            break;
        case 2:
            // Push notification to user for completed job
            sendEmailAndNotificationToUserViaId(request.params.customer.objectId, 'Your car wash is complete!');
            break;
        case 3:
            sendEmailAndNotificationToUserViaId(request.params.employee.objectId, "You've been paid!");
            break;

    }


    /**
     * Notify every employee via email or push notification of a new job
     *
     * TODO: Paramatize by location for expansion
     * @param message
     */
    function notifyEmployeesOfNewJob(message) {
        var query = new Parse.Query("User");
        query.equalTo("role", 1);

        query.find({
            success: function (results) {
                maxCount = results.length * 2;

                // Notify each employee via the given medium
                for (var i = 0; i < results.length; i++) {
                    var employee = results[i];
                    var employeeDeviceId = employee.get('installId');

                    // Send push notification if they have the app
                    if (employeeDeviceId) {
                        sendPushNotificationToUser(employeeDeviceId, 'A new job is available in your area.');
                    } else {
                        maxCount--;
                    }

                    sendEmailToUser(employee.get('email'), message);
                }

                complete();

            },  error: function (error) {
                console.log(error.message);
            }
        });
    }

    /**
     * Grab the associated user and send them the message via email and push notification
     * @param job
     * @param message
     */
    function sendEmailAndNotificationToUserViaId(userId, message) {
        var query = new Parse.Query(Parse.User);
        query.equalTo('objectId', userId);

        query.find({
            success: function (results) {
                maxCount = results.length * 2;

                if (results.length > 0) {
                    var user = results[0];
                    var userInstallId = user.get('installId');

                    if (userInstallId) {
                        sendPushNotificationToUser(userInstallId, message);
                    } else {
                        maxCount--;
                    }

                    sendEmailToUser(user.get('email'), message);
                }

                complete();

            },
            error: function (error) {

            }
        });

    }

    /**
     * Send a push notification to the given installation id
     * @param installationId
     * @param message
     */
    function sendPushNotificationToUser(installationId, message) {
        var query = new Parse.Query(Parse.Installation);
        query.equalTo("installationId", installationId);

        Parse.Push.send({
            where: query, // Set our Installation query
            data: {
                alert: message
            }
        }, {
            success: function () {
                runningCount++;
                complete();
            },
            error: function (error) {
                // Handle error
            }
        });
    }

    function sendEmailToUser(email, message) {
        Parse.Cloud.httpRequest({
            method: "POST",
            url: "http://paulgerlich.com/php/send_single_mail.php",
            body: {
                email : email,
                message: message
            },
            success: function(httpResponse) {
                runningCount++;
                complete();
            }
        });
    }

    function complete(){
        if ( runningCount == maxCount && runningCount != 0) {
            status.success();
        }
    }

});