const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.SECRET_KEY);
const uuid = require('uuid');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());



app.get('/', (req, res) => {
    res.send('IT WORKS')
});

app.post('/payment', (req, res, next) => {
    
    const { product, token } = req.body;
    console.log(product);
    console.log(product.price);
    const idempotencyKey = uuid();

    return stripe.customer.create({
        email: token.email,
        source: token.id
    }).then(customer => {
        stripe.charges.create({
            amount: product.price*100,
            customer: customer.id,
            currency: 'USD',
            receipt_email: token.email,
            description: product.name,
            shipping: {
                name: token.card.name,
                address: {
                    country: token.card.address_country
                }
            }
        }, {idempotencyKey})
    })
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json(err))


})


const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`app listening on port: ${port}`))