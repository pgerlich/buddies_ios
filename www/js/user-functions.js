$(document).ready(initializeMain);

/**
 Initialize Parse and load our UI
 */
function initializeMain() {
    //Initialize JQuery
    Parse.$ = jQuery;
    Parse.initialize("Nw7LzDSBThSKyvym6Q7TwDWcRcz44aOddL75efLL", "ZQPEog0nlJgVwBSbHRfgiGeWNTczY8Lr7PXeUWMU");
}

function redirectToProfile() {
    var currentUser = Parse.User.current();

    if (currentUser) {
        window.location.assign("profile.html")
    }
}

/**
 * Function to log a user in to Parse
 */
function login() {
    var email = $("#inputEmail").val();
    var password = $("#inputPassword").val();

    Parse.User.logIn(email, password, {
        success: function (user) {
            var role = user.get("role");
            var location = "profile.html";

            switch (role) {
                case 0:
                    location = "schedule.html";
                    break;
                case 1:
                    location = "jobs.html";

                    ParsePushPlugin.getInstallationId(function (id) {
                        if (!user.get('installId')) {
                            user.set('installId', id);

                            user.save();

                            var query = new Parse.Query(Parse.Installation);
                            query.equalTo('installationId', id);

                            query.find({
                                success: function (installation) {
                                   installation[0].set('channels', ['employee']);
                                   installation[0].save();
                                },
                                error: function (error) {

                                }
                            });
                        }
                    });

                    break;
                case 2:
                    location = "jobs.html";
                    break;
                default:
                    break;
            }

            window.location.assign(location);
        },

        error: function (user, error) {
            //TODO: Error Handling
            alert("Error: " + error.code + " " + error.message);
        }
    });

}

/**
 Log the user out
 */
function logout() {
    Parse.User.logOut();
    window.location.assign("login.html")
}