# CouchD Role Switcher
A simple Node script which accepts a new role and adds it to every user in a CouchDB instance. 

https://user-images.githubusercontent.com/8253488/185659042-4532b767-c96e-4dd8-848a-974ef6cbd67c.mp4

## Requirements

* Node 12 LTS or later
* `npm`

## Install

Run `npm ci` before using

## Use

You to need have two environment variables set to us this script:

* `ROLE` - the string value of the permission you want to add
* `COUCH_URL` - the URL of your couch instance. should be in a https://USER:PASSWORD@URL:PORT format

Here's an example call adding the role `foo` on a URL of `192-168-68-26.my.local-ip.co` with user of `admin` 
and a password of `password`. Port is implicit as `443`:

```shell
ROLE=foo COUCH_URL=https://admin:password@192-168-68-26.my.local-ip.co node .

set success: josh
set success: abdul
set success: ting
set success: tom

```

## Notes
* First user returned should be `_design/_auth` and [is always skipped](https://github.com/mrjones-plip/couchdb-role-switcher/blob/main/index.js#L44).
* If you're hitting CouchDB through a proxy and updating a lot users (>500), you should try and bypass the proxy to talk to DB directly. In testing, I saw errors like  `Client network socket disconnected before secure TLS connection was established`. 
