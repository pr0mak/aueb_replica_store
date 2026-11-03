# Istos_part2

    npm install express mongoose dotenv cors bcrypt jsonwebtoken
    
    node server.js
    
    npm run seed

API ---> GET(get), POST(create), PUT(update), DELETE(delete)

    /api/store				GET
    /api/store/clothes			GET
    /api/store/clothes/{id}			GET , POST , PUT
    /api/store/office_supplies		GET
    /api/store/office_supplies/{id}		GET , POST , PUT
    /api/store/accessories			GET
    /api/store/accessories/{id}		GET , POST , PUT
    /api/buy				GET , POST
    /api/orders				GET , POST
    /api/auth/register			GET , POST
    /api/auth/login				GET , POST
    /api/admin/products			GET , POST  
    /api/admin/products/{id}		GET , PUT , DELETE

CODES --->

    200 -- OK -- The request is OK (this is the standard response for successful HTTP requests)
    201 -- Created -- The request has been fulfilled, and a new resource is created
    400 -- Bad Request -- The request cannot be fulfilled due to bad syntax
    401 -- Unauthorized	 -- The request was a legal request, but the server is refusing to respond to it. For use when authentication is possible but has failed or not yet been provided
    403 -- Forbidden -- The request was a legal request, but the server is refusing to respond to it
    404 -- Not found -- The requested page could not be found but may be available again in the future

