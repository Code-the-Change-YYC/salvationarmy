# Why is this folder named [...all]

this folder is named that because any request that is sent as a `POST` or `GET` will be routed to this

For example:

```curl
/api/auth/sign-up/email
OR
/api/auth/sign-out
```

The `[...]` basically acts as a dynamic placeholder for all calls starting with `/api/auth`.

Ex:

A curl request like `POST/api/auth/sign-up/email` will map to the better auth function `auth.api.signUp.email`
