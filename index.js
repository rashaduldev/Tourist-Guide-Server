const express = require('express')
const cors = require('cors')
var jwt = require('jsonwebtoken');
const app = express()
const port=process.env.PORT || 8000

// Malware configuration
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

    const usercollection = client.db("Tour").collection("users");
    const packagecollection = client.db("Tour").collection("packages");
    const wishlistcollection = client.db("Tour").collection("wishlists");
    const guidecollection = client.db("Tour").collection("guides");
    const storiecollection = client.db("Tour").collection("stories");
    const blogcollection = client.db("Tour").collection("blogs");
    const bookingcollection = client.db("Tour").collection("bookings");


     // JWt Related API
     app.post('/jwt',async(req,res)=>{
      const user=req.body;
      const token=jwt.sign(user,'2013a0789994ee1e32edf86c326ec4b1144f1467195a282dfd25137d2498578cbb50ecfea13547225fb097bda592639562db75d7db1273d03b79917ff544fb59',{
        expiresIn:'1h'
      });
      res.send({token})
    })
     // use varify admin after access token
     const verifyadmin=async(req, res,next)=>{
      const email=req.decoded.email;
      const query={email:email}
      const user=await usercollection.findOne(query);
      const isAdmin=user?.role==='admin';
      if (!isAdmin) {
        return res.status(404).send({message:'Forbidden access denied'})
      }
      next();
    }
     // Verified token middleware
     const verifyToken=(req,res,next) =>{
      console.log('Inside token middleware',req.headers.authorization);
      if (!req.headers.authorization) {
        return res.status(401).send({message: 'Unauthorized access'});
      }
      const token=req.headers.authorization.split(' ')[1];
      jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
        if (err) {
          return res.status(401).send({message: 'Unauthorized access'});
        }
        req.decoded=decoded;
        next();
      })
      // next();
    }
    app.get('/users/admin/:email',verifyToken,async(req,res)=>{
      const email=req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({message: 'Unauthorized access'});
      }
      const query={email:email}

      const user=await usercollection.findOne(query);
      let admin=false;
      if (user?.role === 'admin') {
        admin=true;
      }
      res.send({admin});
    })

        // Users related api
        app.post('/users',async(req,res) => {
          const user=req.body;
          const query = {email:user.email}
          const existingUser=await usercollection.findOne(query);
          if (existingUser) {
            return res.send({ message: 'user already exists', insertedId: null })
          }
          const result=await usercollection.insertOne(user);
          res.send(result)
      })
      // get user to Display
      app.get('/users',verifyToken,verifyadmin, async(req,res)=>{
        console.log(req.headers);
        const result=await usercollection.find().toArray();
        res.send(result);
      })


    // .--------------------------

    app.get('/packages',async(req,res) => {
      const result=await packagecollection.find().toArray();
      res.send(result)
  })
  // storiecollection
  app.get('/stories',async(req,res) => {
    const result=await storiecollection.find().toArray();
    res.send(result)
})
  // blogcollection
  app.get('/blogs',async(req,res) => {
    const result=await blogcollection.find().toArray();
    res.send(result)
})
  // guidecollection
  app.get('/guides',async(req,res) => {
    const result=await guidecollection.find().toArray();
    res.send(result)
})
// booking
    app.get('/bookings',async(req,res) => {
      const email=req.query.email;
      const query={email: email}
      const result=await bookingcollection.find(query).toArray();
      res.send(result)
  })
     // delete booking item
   app.delete('/bookings/:id',async(req,res) => {
    const id=req.params.id;
    const query={_id: new ObjectId(id)}
    const result=await bookingcollection.deleteOne(query);
    res.send(result)
})
  // booking collection
    app.post('/bookings',async(req,res) => {
      const cartItem=req.body;
      const result=await bookingcollection.insertOne(cartItem);
      res.send(result)
  })

  // wishlists collection
    app.post('/wishlists',async(req,res) => {
      const cartItem=req.body;
      const result=await wishlistcollection.insertOne(cartItem);
      res.send(result)
  })
    // post wishlists data read
    app.get('/wishlists',async(req,res) => {
      const email=req.query.email;
      const query={email: email}
      const result=await wishlistcollection.find(query).toArray();
      res.send(result)
  })
   // delete wishlists item
   app.delete('/carts/:id',async(req,res) => {
    const id=req.params.id;
    const query={_id: new ObjectId(id)}
    const result=await wishlistcollection.deleteOne(query);
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