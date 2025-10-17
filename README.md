# fill-me-up
## fillMeUp - food delivery

Dummy project for mocking food delivery services like Wolt or Glovo. 

Dependencies used:
* Node + express (http server)
* Mongoose (database)
* Pino (logger)
* zod (object parser and validator)

## Prerequisites
### MongoDB
```bash
```

## How to run
```bash
cp .env.example .env
npm install
```
```bash
npm run build
npm start
```
`npm run dev` - development

# How to test
`npm run test` - unit tests

# TimeTracking
* 4.5H - project bootstrap (health endpoint, logging working) & familiarization with node structure
* 3H - setup database, generate models, add routes
* 3H - dealing with models, correct relations, proper loading & familiarizing with it, 
* 1H - implementing business logic (functional requirements) for placing orders
* 2H - optimizing: seperating routes (API), controllers and business logic, propagating errors properly
* 2H - working with transactions, adapting mongodb settings&connection, added updateOrderStatus method
* 6H - improvements & optimizations