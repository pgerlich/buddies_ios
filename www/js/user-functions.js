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

            console.log('hit');

            // Register user for push notification if applicable
            registerForAndReceivePushNotifications(user);
        },

        error: function (user, error) {
            //TODO: Error Handling
            alert("Error: " + error.code + " " + error.message);
        }
    });

}

/**
 * Register a user to receive appropriate push notifications
 * @param user
 */
function registerForAndReceivePushNotifications(user){
	console.log('hit');

    if ( window.ParsePushPlugin ) {
        ParsePushPlugin.getInstallationId(function (id) {
            if (user.get('installId') == '' || !user.get('installId')) {
                user.set('installId', id);
                user.save();
            }

            moveToLocation(user.get('role'));
        });
    } else {
        moveToLocation(user.get('role'));
    }

}

/**
 * Forward user to the correct window
 * @param role
 */
function moveToLocation(role){
    var location = "profile.html";

    switch (role) {
        case 0:
            location = "schedule.html";
            break;
        case 1:
            location = "jobs.html";
            break;
        case 2:
            location = "jobs.html";
            break;
        default:
            break;
    }

    window.location.assign(location);
}

/**
 Log the user out
 */
function logout() {
    Parse.User.logOut();
    window.location.assign("login.html")
}