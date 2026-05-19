const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");
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
    const bookingCollection = db.collection("bokking");


    await client.connect();

   const JWKS = createRemoteJWKSet(
    new URL("http://localhost:3000/api/auth/jwks")
   )
    const verifyToken = async(req,res,next)=>{
      const auhHeaders = req?.headers.authorization;
      // console.log(auhHeaders);

      if(!auhHeaders){
        return res.status(401).json({message:"unauthorization"});
      }
      const token = auhHeaders.split(" ")[1];
      // console.log(token);
       if(!token){
        return res.status(401).json({message:"unauthorization"});
      }

      try{
        const {payload}=await jwtVerify(token,JWKS);
        console.log(payload);
        next();
      }catch(error){
        return res.status(403).json({message:"Forbidden"});
      }

    }


    app.get("/destination",async(req,res)=>{
      const result = await destinationsCollection.find().toArray();
      res.json(result);
      
    })

    app.get("/destination/:id",verifyToken,async(req,res)=>{
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

  app.get('/booking/:userId',async(req,res)=>{
    const {userId}= req.params;
    const result = await bookingCollection.find({userId}).toArray();
    res.json(result);
  })

  app.post('/booking',verifyToken,async(req,res)=>{
    const bodkigData= req.body;
    const result = await bookingCollection.insertOne(bodkigData)
    res.json(result)
  })
  
  app.delete("/booking/:bookingId",async(req,res)=>{
    const {bookingId}=req.params;
    const result= await bookingCollection.deleteOne({_id:new ObjectId(bookingId)});
    res.json(result)
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