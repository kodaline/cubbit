# A simple S3-compatible HTTP service

## Repo structure

* source
  * controllers
    - local.ts
  * dto
    - xml-data.dto.ts
  * errors
  * helpers
    - helper.ts
  * routes
    - endpoints.ts
  * db.ts
  * server.ts
* Dockerfile
* package.json
* tsconfig.json
* README.md

## How to start the server

Install the dependencies of the package.json with

```npm install```

Then start the server with 

```npm run dev```

## How to test the endpoints

**create-bucket**

```aws s3api --no-sign-request --endpoint-url http://localhost:8080 create-bucket --debug --bucket cubbit-bucket```

**put-object**

```aws s3api --no-sign-request --debug --endpoint-url http://localhost:8080 put-object --bucket cubbit-bucket --key folder/cubbit-logo.png --body cubbit-logo.png```

**list-objects**

```aws s3api --no-sign-request --endpoint-url http://localhost:8080 list-objects --bucket cubbit-bucket --debug```

**list-object with prefix**

```aws s3api --no-sign-request --endpoint-url http://localhost:8080 list-objects --bucket cubbit-bucket --debug --prefix folder/```

**get-object**

```aws s3api --no-sign-request --debug --endpoint-url http://localhost:8080 get-object --bucket cubbit-bucket --key folder/cubbit-logo.png ./downloaded/cubbit-logo.png```

**get-object with range**

```aws s3api --no-sign-request --debug --endpoint-url http://localhost:8080 get-object --bucket cubbit-bucket --key folder/cubbit-logo.png --range bytes=12-1234567 ./downloaded/cubbit-logo.png```

## Docker

**Build**

```docker build . -t cubbitest```

**Run container**

```docker run -p 8080:8080 --rm --name cubbit cubbitest```


## General unordered TODOs

- DB server (mysql or any other DBMS)
- security checks on objects being put on the bucket
- use sql prepared statements
- structured and standardized json responses
- manage subrequest folder hierarchy
- automatic tests
- get multiple objects
- api.ts testing and usage with aws sdk api
- remove debug logs
- xml templating
- error messages of API based on client interpretation of the response
- make the tool ready for production