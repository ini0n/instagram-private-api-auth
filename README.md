# instagram-private-api-auth 
![](https://img.shields.io/npm/v/instagram-private-api-auth.svg)
![](https://img.shields.io/github/license/ini0n/instagram-private-api-auth.svg)

---
Wrapper for [instagram-private-api](https://github.com/dilame/instagram-private-api) that support Two Factor Authentication (2FA) and have simple console interface.

---

## Installation
```
npm install instagram-private-api
npm install instagram-private-api-auth
```
or
```
npm install git+https://git@github.com/dilame/instagram-private-api.git
npm install git+https://git@github.com/ini0n/instagram-private-api-auth.git
```

---
## Example
Get session by credentials and get last user media in profile.
```javascript
const Client = require('instagram-private-api').V1
const AuthService = require('instagram-private-api-auth').AuthService(Client)
const _ = require('lodash')

async function getLastUserMedia(session, userId) {
    const feed = new Client.Feed.UserMedia(session, userId)
    const lastMedias = await feed.get()
    return _.head(lastMedias)
}

async function main() {
    try {
        const userSession = await AuthService.getSession('username', 'password')
        const account = await userSession.getAccount()
        let lastUserMedia = await getLastUserMedia(userSession, account.params.id)
        // lastUserMedia should be Media {}
        console.log(lastUserMedia)
    } catch (error) { 
        console.log(error)
    }
}

main().finally(() => process.exit(1))
```