const request = require('request-promise-native');

const role_to_use = process.env.ROLE;
const couch_url = process.env.COUCH_URL;

if(role_to_use === undefined) {
    console.log('ROLE is not set, please set it and try again');
    process.exit(1);
}
if(couch_url === undefined) {
    console.log('COUCH_URL is not set, please set it and try again');
    process.exit(1);
}

const compileUrl = (path) => {
    try {
        return new URL(path, couch_url).href;
    } catch(e) {
        throw new Error(`Error while creating url: ${e.message}`);
    }
};

const getAllUsers = async () => {
    const uri = compileUrl('/_users/_all_docs');
    return request.get({ uri, json: true});
}

const filterOutAdmins = (users) => {
    if (typeof users.rows === 'object' && users.rows.length > 1){
        // first user is always admin user, let's not mess with them
        users.rows.shift();
        console.log(`${users.rows.length} total users found.`);
        return users.rows;
    }
    return [];
};

const getUpdatedUsers = async (allUsers) => {
    const updates = [];
    for (const user of allUsers) {
        const uri = compileUrl('/_users/' + user.id);
        const newuser = await request.get({ uri, json: true });
        if (typeof newuser.roles === 'object' && !newuser.roles.includes(role_to_use)) {
            newuser.roles.push(role_to_use);
            updates.push(newuser);
        }
    }
    return updates;
}

const saveUsers = async (users) => {
    for (const user of users) {
        const userId = user._id.split(':')[1];
        const uri = compileUrl('/_users/' + user._id);
        await request.put({ uri, json: true, body: user });
    }
    console.log(`${users.length} needed the permission added.`);
}

const go = async () => {
    console.log("\nStart\n");
    try {
        const allUsers = await getAllUsers();
        const nonAdmins = await filterOutAdmins(allUsers);
        const updatedUsers = await getUpdatedUsers(nonAdmins);
        await saveUsers(updatedUsers);
    } catch (e) {
        if (e.statusCode === 401) {
            console.log('Bad authentication for CouchDB. Check that COUCH_URL has correct username and password.');
        } else {
            console.log("Error! " + e.message);
            console.log("\nPass DEBUG=True to see stack trace");
            if (process.env.DEBUG === "True"){
                console.log("\n" + e.stack);
            }
        }
    }
    console.log("\nEnd\n");
};

go();
