# fill-me-up
## fillMeUp - food delivery

Dummy project for mocking food delivery services like Wolt or Glovo. 

Dependencies used:
* Node + express (http server)
* Mongoose (database)
* Pino (logger)
* zod (object parser and validator)

## Prerequisites
* local MongoDB 7 (`brew install mongodb-community@7.0`)

## How to run
_I have not been able to setup dockerization since my system is too old for docker daemon (MacOS 12),
so everything is running on local machine._

* Start MongoDB
```bash
mongod --config /Users/zmajeric/work/node-api-starter-full/mongod.conf
node scripts/db_setup.ts # required only once
```
* start server
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
* 6-8H - improvements & optimizations

## Notes
* There are some improvements that I am aware of but didnt do due to time constraints: moving business logic for other 
models to controller and service, adding DAL layer (repository) to decauple and make it easier to mock.
* I couldnt setup docker and spent quite a while dealing with dependencies for node and dev tools in general. My older 
version of macbook from 2014 didnt support newer versions of osx, which I didnt anticipate at all. Because of that I didnt 
deliver on time I personally set, for which I apologize.
* I tried to time track as best as I could, mainly for personal reference and I believe its a good practice. 

## Testing endpoints 

### Health Check

- GET /health - Check if the service is runing
    ```bash
    curl -X GET http://localhost:3000/health
    ```

### Users

- POST /api/v1/users - Create a new user
    - Required fields: email, password, name
    ```bash
    curl -X POST http://localhost:3000/api/v1/users \
         -H "Content-Type: application/json" \
         -d '{"email": "user@example.com", "password": "password123", "name": "John Doe"}'
    ```

### Restaurants

- GET /api/v1/restaurants - Get list of all restaurants
    ```bash
    curl -X GET http://localhost:3000/api/v1/restaurants
    ```
- POST /api/v1/restaurants - Create a new restaurant
    - Required fields: name, address
    - Optional fields: phone, cuisine, isActive
    ```bash
    curl -X POST http://localhost:3000/api/v1/restaurants \
         -H "Content-Type: application/json" \
         -d '{"name": "Restaurant Name", "address": "123 Main St", "phone": "1234567890", "cuisine": "Italian", "isActive": true}'
    ```
- POST /api/v1/restaurants/:id/menu-items - Add menu items to restaurant
    - Required fields: array of items with name and price
    ```bash
    curl -X POST http://localhost:3000/api/v1/restaurants/restaurant_id/menu-items \
         -H "Content-Type: application/json" \
         -d '[{"name": "Pizza", "price": 10.99}, {"name": "Pasta", "price": 8.99}]'
    ```

### Orders

- GET /api/v1/orders - Get list of all orders
    ```bash
    curl -X GET http://localhost:3000/api/v1/orders
    ```
- GET /api/v1/orders/:id - Get order details by ID
    ```bash
    curl -X GET http://localhost:3000/api/v1/orders/order_id
    ```
- POST /api/v1/orders - Create a new order
    - Required fields: userId, restaurantId, items (array of menu item IDs)
    ```bash
    curl -X POST http://localhost:3000/api/v1/orders \
         -H "Content-Type: application/json" \
         -d '{"userId": "user_id", "restaurantId": "restaurant_id", "items": ["item_id1", "item_id2"]}'
    ```
- PATCH /api/v1/orders/:id/status - Update order status
    - Required fields: status (CONFIRMED, DELIVERED, or CANCELLED)
    ```bash
    curl -X PATCH http://localhost:3000/api/v1/orders/order_id/status \
         -H "Content-Type: application/json" \
         -d '{"status": "CONFIRMED"}'
    ```