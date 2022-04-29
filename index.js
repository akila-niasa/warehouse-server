const express=require("express")
require("dotenv").config()
const app =express()
const cors=require("cors")
const port=process.env.PORT||5000



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xmrlv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });

async function run(){
    try{
        await client.connect();
        const inventoryCollection = client.db("warehouse").collection("inventories");


        app.get('/product',async(req,res)=>{
            // const query={}
            const data=req.query

            const products = await inventoryCollection.find(data).toArray();
            
            res.send(products);
        })

        app.get('/product/:id',async(req,res)=>{
            const id=req.params.id
            const query={_id:ObjectId(id)}
            const result=await inventoryCollection.findOne(query)
            res.send(result)
        })
    }
    finally{

    }
}
run().catch(console.dir)

app.use(cors())
app.use(express.json())

app.get('/',(req,res)=>{
    res.send('CURD is running')
})

app.listen(port,()=>{
    console.log('CURD is running',port);
})