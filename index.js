const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
dotenv.config()

const uri = process.env.MONGODB_URI;


const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {

    const db = client.db("wanderlust");
    const destinationsCollection = db.collection("destions");

    await client.connect();


    app.get("/destination",async(req,res)=>{
      const result = await destinationsCollection.find().toArray();
      res.json(result);
      
    })

    app.get("/destination/:id",async(req,res)=>{
      const {id} = req.params;
      const result = await destinationsCollection.findOne({
        _id: new ObjectId(id)
      });
      res.send(result)
    })

  app.patch("/destination/:id",async(req,res)=>{
    const {id}= req.params;
    const updateData  = req.body;
    const result = await destinationsCollection.updateOne(
      {_id:new ObjectId(id)},
      {$set:updateData}
    )
    res.send(result)
  })

  app.delete("/destination/:id",async(req,res)=>{
    const {id}= req.params;
    const result = await destinationsCollection.deleteOne(
      {_id:new ObjectId(id)}
    )
    res.send(result)
  })

    app.post("/destinations", async(req,res)=>{
      const  destinationsData = req.body;
      const result = await destinationsCollection.insertOne(destinationsData);
      
      res.json(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   
  }
}
run().catch(console.dir);



app.get("/",(req,res)=>{
    res.send("wanderlust server runig fine !")
})

app.listen(port,()=>{
    console.log(`Server is runnig on port ${port}`);
})