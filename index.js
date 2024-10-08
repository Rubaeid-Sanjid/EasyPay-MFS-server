const express = require("express")
const cors = require("cors")
require('dotenv').config();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcryptjs');

//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b8fibtq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const usersCollection = client.db("easypay").collection("users");

    app.post('/jwt', async(req, res)=>{
      const user_email = req.body;
      const token = jwt.sign(user_email, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '2h'});
      res.send({token});
    })

    app.post('/users', async(req, res)=>{
      const userInfo = req.body;

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userInfo.user_pin, salt);
      userInfo.user_pin = hashedPassword;
      
      const result = await usersCollection.insertOne(userInfo);      
      res.send(result);
    })

    app.get('/user/:email', async(req, res)=>{
      const userEmail = req.params.email;
      const query = {user_email: userEmail};
      const result = await usersCollection.findOne(query);
      res.send(result);
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

app.get("/", async(req, res)=>{
    res.send("MFS-server is running.")
})

app.listen(port, ()=>{
    console.log(`server port is ${port}`);
})