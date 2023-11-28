const express = require('express')
const cors = require('cors')
const app = express()
const port=process.env.PORT || 8000

// Malware configuration
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://mdrashadul898:wkYD1prFIEg6WmZN@cluster0.jaw4lpx.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const packagecollection = client.db("Tour").collection("packages");
    const wishlistcollection = client.db("Tour").collection("wishlists");

    app.get('/packages',async(req,res) => {
      const result=await packagecollection.find().toArray();
      res.send(result)
  })

  // wishlists collection
    app.post('/wishlists',async(req,res) => {
      const cartItem=req.body;
      const result=await wishlistcollection.insertOne(cartItem);
      res.send(result)
  })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Server is running')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})