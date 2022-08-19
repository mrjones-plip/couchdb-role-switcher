'use strict';
const request = require('request-promise-native');

const role_to_use = process.env.ROLE;
const couch_url = process.env.COUCH_URL;
let compiledUrl = {};

if(role_to_use === undefined){
    console.log('ROLE is not set, please set it and try again');
    process.exit(1);
}
if(couch_url === undefined){
    console.log('COUCH_URL is not set, please set it and try again');
    process.exit(1);
}

const handleError = function(e){
    if (e.statusCode === 401) {
        console.log('Bad authentication for CouchDB. Check that COUCH_URL has correct usernames and passwords.');
        process.exit(1);
    } else {
        console.log('Error connecting to CouchDB: ' + e.message);
        process.exit(1);
    }
}

const getAllUsers = function (){
    try {
        compiledUrl = new URL('/_users/_all_docs', couch_url);
    } catch(e) {
        console.log('Error while creating url: ', e.message);
        process.exit(1);
    }

    const options = {
        uri: compiledUrl.href,
        json: true
    };

    return request.get(options)
        .then(users => {
            if (typeof users.rows === 'object' && users.rows.length > 0){
                // first user is always admin user, let's not mess with them
                users.rows.shift();
                return users.rows;
            } else {
                console.log('No users found');
                process.exit(1);
            }
        })
        .catch(e => {
            handleError(e);
        })
}

const getUserPerms = function (allUsers){
    allUsers.forEach((username)=>{
        const userId = username.id;
        try {
            compiledUrl = new URL('/_users/' + userId, couch_url);
        } catch(e) {
            console.log('Error while creating url: ', e.message);
            process.exit(1);
        }

        const options = {
            uri: compiledUrl.href,
            json: true
        };

        return request.get(options)
            .then(userData => {
                if (typeof userData.roles === 'object'){
                    if (!userData.roles.includes(role_to_use)){
                        userData.roles.push(role_to_use);
                        const usernameAry = userId.split(':');
                        setPermission(userId, {
                                'roles': userData.roles,
                                '_rev': userData._rev,
                                'type': "user",
                                'name': usernameAry[1],
                            }
                        );
                    }
                }
            })
            .catch(e => {
                handleError(e);
            });
    })
}

const setPermission = function(userId, userRoles){
    let compiledUrl
    let options;
    try {
        compiledUrl = new URL('/_users/' + userId, couch_url);
    } catch(e) {
        console.log('Error while creating url:', e.message);
        process.exit(1);
    }
    options = {
        uri: compiledUrl.href,
        json: true,
        body: userRoles,
    };

    return request.put(options)
        .then(() => {
            console.log('set success:', userRoles.name);
        })
        .catch(e => {
            console.log('set FAIL:', userId, 'for roles:', userRoles, ' at URL ', compiledUrl.href);
            handleError(e);
        });
}
getAllUsers()
    .then((allUsers) => getUserPerms(allUsers));
