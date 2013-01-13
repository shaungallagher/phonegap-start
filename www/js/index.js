/*jslint debug: true, browser: true, devel: true */

/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var app = {};

app.initialize = function () {
    console.log('initialize');
    app.bind();
};

app.bind = function () {
    console.log('bind');

    var deviceReadyDeferred = $.Deferred();
    var jqmReadyDeferred = $.Deferred();

    function deviceIsReady() {
        deviceReadyDeferred.resolve();
    }

    function doWhenBothFrameworksLoaded() {
        app.deviceready();
    }

    document.addEventListener("deviceReady", deviceIsReady, false);

    $(document).one("mobileinit", function () {
        jqmReadyDeferred.resolve();
    });

    $.when(deviceReadyDeferred, jqmReadyDeferred).then(doWhenBothFrameworksLoaded);

};

app.deviceready = function () {
    app.report('deviceready');
    if (device && device.uuid) {
        app.report('device.uuid: ' + device.uuid);
        app.login();
    } else {
        app.report('!device.uuid');
    }
};

app.report = function (id) {
    console.log("Report: " + id);
    var c = $('#console');
    var p = $('<p>' + id + '</p>');
    $(c).append(p);
    // findBetty: function () {
    //     console.log('findBetty 2');
    //     var options = new ContactFindOptions();
    //     options.filter = "Betty";
    //     var fields = ["displayName", "name"];
    //     navigator.contacts.find(fields, onSuccess, onError, options);
    // }
};

app.login = function () {
    app.report('login.action');
    var device_id = device && device.uuid;
    var update_id = window.localStorage.getItem("update_id");
    $.ajax({
        url: 'http://www.granniephone.com/api/?action=login&device_id=' +
            device_id + '&update_id=' + update_id,
        dataType: 'jsonp',
        timeout: 3000,
        success: function (data, status) {
            app.report('login.action success: ' + data.response);
        },
        error: function () {
            app.report('login.action error');
        }
    });
};


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

