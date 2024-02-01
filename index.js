const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//Middleware//
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(morgan("dev"));

//MongoDB Codes//
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b4ql9rm.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    //collections//
    const userCollection = client.db("contestDb").collection("users");
    const contestCollection = client.db("contestDb").collection("contests");
    const cartCollection = client.db("contestDb").collection("carts");

    //Getting Users//
    app.get("/users", async (req, res) => {
      try {
        const result = await userCollection.find().toArray();
        res.send(result);
      } catch (err) {
        console.log(err);
      }
    });

    //Posting Users//
    app.post("/users", async (req, res) => {
      try {
        const user = req.body;
        const result = await userCollection.insertOne(user);
        res.send(result);
      } catch (err) {
        console.log(err);
      }
    });

    //Deleting Users//
    app.delete('/users/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })

    //Posting Contests//
    app.post("/contests", async (req, res) => {
      try {
        const contests = req.body;
        const result = await contestCollection.insertOne(contests);
        res.send(result);
      } catch (err) {
        console.log(err);
      }
    });

    //Getting Contests//
    app.get("/contests", async (req, res) => {
      try {
        const result = await contestCollection.find().toArray();
        res.send(result);
      } catch (err) {
        console.log(err);
      }
    });

    //Getting a Single Contest Details//
    app.get("/contests/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await contestCollection.findOne(query);
      res.send(result);
    });

    //Deleting Contests By Admin//
    app.delete('/contests/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await contestCollection.deleteOne(query);
      res.send(result);
    })

    //Posting JWT Token//
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "365d",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? 'none': "strict",
        })
        .send({ success: true });
    });

    //Releifing the JWT Token on LogOut//
    app.get("/logout", async (req, res) => {
      try {
        res
        .clearCookie("token", {
          maxAge: 0,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? 'none': "strict",
        })
        .send({success: true})
        console.log('Logout Successfull');
      } catch (err) {
        console.log(err);
      }
    });

    //Posting Carts//
    app.post('/carts', async(req, res)=>{
      const cartItem = req.body;
      const result = await cartCollection.insertOne(cartItem);
      res.send(result);
    })

    //Get All Cart Items//
    app.get('/carts', async(req, res)=>{
      const result = await cartCollection.find().toArray();
      res.send(result);
    })

    //Getting Single Cart Data//
    app.get('/carts', async(req, res)=>{
      const email = req.query.email;
      const query = {email: email};
      const result = await cartCollection.findOne(query);
      res.send(result);
    })

    //Deleting Cart Items By User//
    app.delete('/carts/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    })

    //Putting Users to DB//
    // app.put('/users/:email', async(req, res)=>{
    //   const email = req.params.email;
    //   const user = req.body;
    //   const query = {email: email}
    //   const options = {upsert: true}
    //   const isExist = await userCollection.findOne(query);
    //   if(isExist) return res.send(isExist);
    //   const result = await userCollection.updateOne(query, {
    //     $set:{...user, timestamp: Date.now()},
    //   },
    //   options
    //   )
    //   res.send(result);
    // })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//Default Codes//
app.get("/", (req, res) => {
  res.send("Server Running Smoothly");
});

app.listen(port, () => {
  console.log(`Server Running on Port ${port}`);
});
