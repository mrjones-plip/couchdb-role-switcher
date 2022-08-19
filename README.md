# CouchD Role Switcher
A simple Node script which accepts a new role and adds it every user in a CouchDB instance. 

## Requirements

* Node 12 LTS or later
* `npm`

## Install

Rune `npm ci` before using

## Use

You to need have two environment variables set to us this script:

* `ROLE` - the string value of the permission you want to add
* `COUCH_URL` - the URL of your couch instance. should be in a https://USER:PASSWORD@URL:PORT format

Here's an example call adding the role `foo` on a URL of `192-168-68-26.my.local-ip.co` with user of `admin` 
and a password of `password`. Port is implicit as `443`:

```shell
PERM=foo COUCH_URL=https://admin:password@192-168-68-26.my.local-ip.co node .

set success: org.couchdb.user:josh
set success: org.couchdb.user:tom
set success: org.couchdb.user:abdul
```

**NB** - first user returned should be `_design/_auth` and is always skipped.
