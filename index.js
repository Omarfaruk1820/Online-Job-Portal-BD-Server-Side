const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.USER_BD}:${process.env.USER_PASS}@cluster0.g29mryf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();

    const database = client.db("privatejobportalDB");
    const jobCollection = database.collection("jobs");
    const appliyCollection = client
      .db("privatejobportalDB")
      .collection("jobapplication");

    app.get("/jobs", async (req, res) => {
      //jar jar email ase sei email ala data golo nibo
      const email = req.query.email;
      let query = {};

      if (email) {
        query = { hr_email: email };
      }
      const jobs = jobCollection.find(query);
      const result = await jobs.toArray();
      res.send(result);
    });
    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.findOne(query);
      res.send(result);
    });

    app.post("/jobs", async (req, res) => {
      const newJob = req.body;
      const result = await jobCollection.insertOne(newJob);
      res.send(result);
    });
    app.post("/jobapplication", async (req, res) => {
      const jobapplication = req.body;
      const result = await appliyCollection.insertOne(jobapplication);
      ///total posted job ber korbar jobb
      const id = jobapplication.job_id;
      const query = { _id: new ObjectId(id) };
      const job = await jobCollection.findOne(query);
    //   console.log(job);
      let newCount = 0;
      if (job.applicationCount) {
        newCount = job.applicationCount + 1;
      } else {
        newCount = 1;
      }
      const filter = { _id: new ObjectId(id) };
      const updateDac = {
        $set: {
          applicationCount: newCount,
        },
      };
      const updatedResult = await jobCollection.updateOne(filter, updateDac);

      res.send({result,updatedResult});
    });
    app.get("/jobapplication", async (req, res) => {
      const email = req.query.email;
      const query = { applicat_email: email };
      const allJob = appliyCollection.find(query);
      const result = await allJob.toArray();
      for (const jobapplication of result) {
       

        const query1 = { _id: new ObjectId(jobapplication.job_id) };
        const job = await jobCollection.findOne(query1);
        if (job) {
          jobapplication.title = job.title;
          jobapplication.company = job.company;
          jobapplication.company_logo = job.company_logo;
        }
      }
      res.send(result);
    });

    app.get('/jobapplication/:job_id',async(req,res)=>{
        const jobId=req.params.job_id
        const query={job_id:jobId}
        const result=await appliyCollection.findOne(query).toArray()
        res.send(result)
    })
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("this is the private job portal");
});
app.listen(port, () => {
  console.log(`This is the private job portal server side `);
});
