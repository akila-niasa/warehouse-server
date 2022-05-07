const express = require("express")
require("dotenv").config()
const app = express()
const cors = require("cors")
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xmrlv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });

function verification(req, res, next) {
    const tokenInfo = req.headers.authorization
    // console.log(tokenInfo);
    if (!tokenInfo) {
        return res.status(401).send({ message: 'not found' })
    }
    const token = tokenInfo.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: "error found" })
        }
        req.decoded = decoded
        next()
    })
}

async function run() {
    try {
        await client.connect();
        const inventoryCollection = client.db("warehouse").collection("inventories");

        /**
                * Login
         */
        app.post('/login',async(req,res)=>{
            const user=req.body
            console.log(user);
            const token=jwt.sign(user,process.env.ACCESS_TOKEN)
            console.log(token);
            res.send({token})
        })

        app.get('/product', async (req, res) => {
            // const query={}
            const data = req.query

            const products = await inventoryCollection.find(data).toArray();

            res.send(products);
        })

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await inventoryCollection.findOne(query)
            // console.log(result);
            res.send(result)
        })

        app.put('/product/:id', async (req, res) => {
            const id = req.params.id
            // console.log(id);
            // const query={}
            const productQuantity = req.body
            console.log(productQuantity);
            const objectId = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity : productQuantity.updatedQuantity
                },
            };
            const result = await inventoryCollection.updateOne(objectId, updateDoc, options)
            console.log(result);
            res.send(result)
        })

        app.post('/product',async(req,res)=>{
            const newProduct=req.body
            const result=await inventoryCollection.insertOne(newProduct)
            res.send(result)
        })

        app.delete('/product/:id',async(req,res)=>{
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await inventoryCollection.deleteOne(query)
            res.send(result)
        })

        app.get('/addProduct',async(req,res)=>{
            // const tokenInfo=req.headers.authorization
            //    console.log(tokenInfo);
            const decodedEmail=req.decoded.email
            const email = req.query.email
            // console.log(decodedEmail);
            // console.log(email);
        //    if(decodedEmail===email){
            const query = { email: email }

            const result=await inventoryCollection.find(query).toArray()
            res.send(result)
        //    }
        //    else{
        //     res.status(403).send({ success: 'UnAuthoraized Access' })
        //    }
        })

        app.delete('/addProduct/:id',async(req,res)=>{
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await inventoryCollection.deleteOne(query)
            res.send(result)
        })
        
        
    }
    finally {

    }
}
run().catch(console.dir)

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('CURD is running')
})

app.listen(port, () => {
    console.log('CURD is running', port);
})