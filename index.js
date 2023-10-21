const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3x6azjv.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        await client.connect();
        const foodCollection = client.db('foodDB').collection('food')
        const cartCollection = client.db('foodDB').collection('cart')


        // insert data to database
        app.post('/food', async (req, res) => {
            const newFood = req.body;
            const result = await foodCollection.insertOne(newFood);
            console.log(result);
            res.send(result)
        })
        // get data from database
        app.get('/food', async (req, res) => {
            const cursor = foodCollection.find();
            const result = await cursor.toArray();
            console.log(result);
            res.send(result)
        })
        // find data from database
        // app.get('/food/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) }
        //     const result = await foodCollection.findOne(query);
        //     res.send(result);

        // })
        // Space food with category
        app.get('/food/:brandName', async (req, res) => {
            const cursor = foodCollection.find({brandName: req.params.brandName});
            const result = await cursor.toArray();
            console.log(result);
            res.send(result);
        })
        // update food data 
        app.put('/food/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateFood = req.body;
            const food = {
                $set: {
                    name: updateFood.name,
                    brandName: updateFood.brandName,
                    price: updateFood.price,
                    category: updateFood.category,
                    description: updateFood.description,
                    photo: updateFood.photo,
                }
            }
            const result = await foodCollection.updateOne(filter, food, options);
            res.send(result)

        })
            // cart related apis
            app.delete('/carts/:id', async (req, res) => {
                const id = req.params.id;
                console.log("id", id);
                const query = {
                     _id: id
                    };
                const result = await cartCollection.deleteOne(query);
                res.send(result)
            })

            app.get('/cart', async (req, res,) => {
                const cursor = cartCollection.find();
                const result = await cursor.toArray();
                res.send(result)
            }),
            app.post('/cart', async (req, res) => {
                const carts = req.body;
                const result = await cartCollection.insertOne(carts);
                res.send(result);
            })
       



        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



// middleware
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
    res.send('food and bebars')
})

app.listen(port, () => {
    console.log(`food server is running on port: ${port}`)
})