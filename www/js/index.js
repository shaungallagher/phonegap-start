/*jslint debug: true, browser: true, devel: true */

var app = {};

app.report = function (id) {
    console.log("Report: " + id);
    var c = $('#console');
    var p = $('<p>' + id + '</p>');
    $(c).append(p);
};

app.initialize = function () {
    console.log('initialize');
    alert('initialize');
    app.bind();
};

app.bind = function () {
    console.log('bind');
    alert('bind');
    document.addEventListener("deviceReady", app.deviceready, false);
};

app.deviceready = function () {
    app.report('deviceready');
    alert('deviceReady');
    if (device && device.uuid) {
        app.report('device.uuid: ' + device.uuid);
        app.login();
    } else {
        app.report('!device.uuid');
    }
};

app.login = function () {
    app.report('login');
    alert('login');
    var device_id = device && device.uuid;
    var update_id = window.localStorage.getItem("update_id");
    $.ajax({
        url: 'http://www.granniephone.com/api/?action=login&device_id=' +
            device_id + '&update_id=' + update_id,
        dataType: 'jsonp',
        timeout: 3000,
        success: function (data, status) {
            alert('success');
            app.report('login success: ' + data.response);
        },
        error: function () {
            alert('error');
            app.report('login error');
        }
    });
};


// findBetty: function () {
//     console.log('findBetty 2');
//     var options = new ContactFindOptions();
//     options.filter = "Betty";
//     var fields = ["displayName", "name"];
//     navigator.contacts.find(fields, onSuccess, onError, options);
// }

// var onSuccess = function (contacts) {
//     console.log('onSuccess contacts: ', contacts);
//     navigator.notification.alert('onSuccess!', function () {}, 'Title');
//     for (var i=0; i<contacts.length; i++) {
//         document.body.appendChild('<p style="background-color:#0F0">' + contacts[i].displayName +
//             ', <a href="tel:' + contacts[i].phoneNumbers[0] + '</p>');
//     }
// };

// var onError = function (e) {
//     console.log('onError');
//     var contact = navigator.contacts.create();
//     var tContactName = new ContactName();
//     tContactName.givenName = 'Betty';
//     tContactName.LastName = 'Gallagher';
//     contact.name = tContactName;
//     console.log('contact.name: ', contact.name);
//     var phoneNumbers = [];
//     var tPhoneNumber = new ContactField('mobile', '3025551212', true);
//     phoneNumbers.push(tPhoneNumber);
//     console.log('phoneNumbers[0].value: ', phoneNumbers[0].value);
//     contact.phoneNumbers = phoneNumbers;
//     contact.save(function (contact) {
//        navigator.notification.alert('Saved successfully!!!', function (){}, 'Title');
//     }, function (contactError) {
//        navigator.notification.alert('Error contact save: ' + contactError.code, function (){}, 'Title');
//     });
// };

