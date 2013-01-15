/*jslint plusplus: true, browser: true, devel: true */

var app = {};


/**
 * The device ID.
 */
app.device_id = null;


/**
 * The touch items that appear as options in the app.
 * @type {Array}
 */
app.items = [];


/**
 * Output data to both console.log and the DOM.
 * @param  {string} data The data to output.
 */
app.report = function (data) {
    console.log('Report: ' + data);
    var c = $('#console');
    var p = $('<p>' + data + '</p>');
    $(c).append(p);
};


/**
 * Wait for device ready before continuing.
 */
app.initialize = function () {
    console.log('initialize');
    document.addEventListener('deviceReady', app.deviceready, false);
};


/**
 * Check for existence of device ID.
 */
app.deviceready = function () {
    app.report('deviceready');
    if (device && device.uuid) {
        app.report('device.uuid: ' + device.uuid);
        app.device_id = device.uuid;
        app.login();
    } else {
        app.report('!device.uuid');
    }
};


/**
 * Use web API to check whether an update is available.
 */
app.login = function () {
    app.report('login');
    var update_id = window.localStorage.getItem('update_id') || -1;
    $.ajax({
        url: 'http://www.granniephone.com/api/?action=login&device_id=' +
             encodeURIComponent(app.device_id) + '&update_id=' +
             encodeURIComponent(update_id),
        dataType: 'jsonp',
        timeout: 3000,
        success: function (data, status) {
            app.report('login success: ' + data.response);
            if (data.response === 'account_id not found') {
                app.report('app.login: ' + data.response);
            } else if (data.response !== 'up to date') {
                app.updateDB(data);
            } else {
                app.fromDB();
            }
        },
        error: function () {
            app.report('API login error');
        }
    });
};


/**
 * Update the database with the data returned from the web API.
 * @param  {Object} data Data from the web API.
 */
app.updateDB = function (data) {

    var populateDB = function (tx) {
        app.report('app.updateDB - populateDB');
        tx.executeSql('DROP TABLE IF EXISTS data');
        tx.executeSql('CREATE TABLE IF NOT EXISTS data ' +
            '(`id` integer primary key autoincrement, `device_id`, `item`, `key`, `value`)');

        var i, item, properties, j, property;
        for (i = 0; i < data.items.length; i++) {
            item = data.items[i];
            properties = Object.getOwnPropertyNames(item);
            for (j = 0; j < properties.length; j++) {
                property = properties[j];
                tx.executeSql('INSERT INTO data (`device_id`, `item`, `key`, `value`) VALUES (?,?,?,?)',
                    [app.device_id, i, property, item[property]]);
            }
        }
    };

    var errorDB = function (err) {
        app.report('app.updateDB - Error processing SQL: ' + err.code + ', ' + err.message);
    };

    var successDB = function () {
        app.report('app.updateDB - success!');
        window.localStorage.setItem('update_id', data.update_id);
        app.fromDB();
    };

    app.report('app.updateDB');
    app.report('data.items.length: ' + data.items.length);
    var db = window.openDatabase('data', '1.0', 'GranniePhone data', 1000000);
    db.transaction(populateDB, errorDB, successDB);

};


/**
 * Get our settings from the database.
 */
app.fromDB = function () {

    var querySuccess = function (tx, results) {
        app.report('app.fromDB - success!');
        var len = results.rows.length;
        app.report('Results length: ' + len);
        var i, item, key, value;
        for (i = 0; i < len; i++) {
            item = results.rows.item(i).item;
            key = results.rows.item(i).key;
            value = results.rows.item(i).value;
            //app.report('item: ' + item + ', key: ' + key + ', value: ' + value);

            if (key && value) {
                if (!app.items[item] || typeof app.items[item] !== 'object') {
                    app.items[item] = { type: '' };
                }
                app.items[item][key] = value;
            }
        }
        app.drawItems();
    };

    var queryError = function(err) {
        app.report('app.fromDB - queryError: ' + err.code + ', ' + err.message);
    };

    var queryDB = function (tx) {
        tx.executeSql('SELECT * FROM data WHERE device_id=?', [app.device_id],
            querySuccess, queryError);
    };

    var errorDB = function (err) {
        app.report('app.fromDB - errorDB: ' + err.code + ', ' + err.message);
    };

    app.report('app.fromDB');
    var db = window.openDatabase('data', '1.0', 'GranniePhone data', 1000000);
    db.transaction(queryDB, errorDB);

};


/**
 * Loop through app.items and draw items on the screen.
 */
app.drawItems = function () {
    app.report('drawItems');
    app.report('app.items.length: ', app.items.length);
    var i, itembox;
    for (i = 0; i < app.items.length; i++) {
        itembox = $('<div class="itembox"></div>');
        $(itembox).addClass('itembox-' + i);

        if (app.items[i].type == 'dial') {
            app.items[i].number = '';
        }

        $(itembox).attr('data-type', app.items[i].type);
        $(itembox).append('<p>' + app.items[i].type + '</p>');
        if (app.items[i].name) {
            $(itembox).attr('data-name', app.items[i].name);
            $(itembox).append('<p>' + app.items[i].name + '</p>');
        }
        if (app.items[i].number) {
            $(itembox).attr('data-number', app.items[i].number);
            $(itembox).append('<p>' + app.items[i].number + '</p>');
        }
        $('#console').append(itembox);
    }
    var windowHeight = $(window).height();
    $('.itembox').height(windowHeight/4);

    $(document).on('tap', '.itembox', function() {
        app.report('tap event: ' + app.items[i].number);
        document.location = 'tel: ' + app.items[i].number;
    });

};


// findBetty: function () {
//     console.log('findBetty 2');
//     var options = new ContactFindOptions();
//     options.filter = 'Betty';
//     var fields = ['displayName', 'name'];
//     navigator.contacts.find(fields, onSuccess, onError, options);
// }

// var onSuccess = function (contacts) {
//     console.log('onSuccess contacts: ', contacts);
//     navigator.notification.alert('onSuccess!', function () {}, 'Title');
//     for (var i=0; i<contacts.length; i++) {
//         document.body.appendChild('<p style="background-color:#0F0">' + contacts[i].displayName +
//             ', <a href="tel:' + contacts[i].phoneNumbers[0] + '">contacts[i].phoneNumbers[0]</a></p>');
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

