require('dotenv').config();
var express = require("express");
var MongoClient = require("mongodb").MongoClient;
var cors = require("cors");
const multer = require("multer");
const uuid = require('uuid');

var app = express(); 
app.use(cors(
  {
    origin:["http://localhost:3000/","https://todo-website-naveen4.vercel.app/","https://todo-website-drab.vercel.app/","https://todo-website-git-main-naveen4.vercel.app/","https://todo-website-dcmqddldl-naveen4.vercel.app/"],
    methods:["POST","PUT","GET","DELETE"],
    credentials:true
  }
));
var CLUSTER_IP1 = "152.58.212.84";
function generateRandomId() {
  return uuid.v4();
}

var CONNECTION_STRING = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASS_WORD}@cluster0.zbounx6.mongodb.net/?retryWrites=true&w=majority`;
var DATABASE_NAME = process.env.DATABASENAME;


var database;
const port = process.env.PORT || 8080;
app.listen(port, () => {
  MongoClient.connect(CONNECTION_STRING, (error, client) => {
    database = client.db(DATABASE_NAME); 
    console.log("MongoDB connection successful");
  });
});

app.get('/',(request,response)=>{
  const data = {
    dbName : process.env.DATABASENAME,
    collName : process.env.COLLECTIONNAME,
    userName : process.env.USER_NAME,
    passwrd : process.env.PASS_WORD
  }
  response.send(data)
})

app.get('/api/todoapp/GetNotes',(request,response)=>{
    database.collection(process.env.COLLECTIONNAME).find({}).toArray((error,result)=>{
        response.send(result)
    })
})


app.post('/api/todoapp/AddNotes', multer().none(), async (request, response) => {
    try {
      const count = await database.collection(process.env.COLLECTIONNAME).countDocuments();
      const newNotes = {
        id: generateRandomId(),
        description: request.body.newNotes
      };
  
      const result = await database.collection(process.env.COLLECTIONNAME).insertOne(newNotes);
  
      response.json({ message: "Added Successfully", newNotes });
    } catch (error) {
      console.error("Error adding note:", error);
      response.status(500).json({ error: "Internal Server Error" });
    }
  });


  app.put('/api/todoapp/UpdateNotes', multer().none(), async (request, response) => {
    try {
        const noteId = request.query.id;
        const updatedNotes = {
            id: noteId,
            description: request.body.updatedNotes,
            type: "done"
        };

        const existingNote = await database.collection(process.env.COLLECTIONNAME).findOne({ id: noteId });
      

        if (!existingNote) {
          console.log(noteId)
            return response.status(404).json({ error: "Note not found" });
        }

        await database.collection(process.env.COLLECTIONNAME).updateOne({ id: noteId }, { $set: updatedNotes });

        response.json({ message: "Updated Successfully", updatedNotes });
    } catch (error) {
        console.error("Error updating note:", error);
        response.status(500).json({ error: "Internal Server Error" });
    }
});


app.delete('/api/todoapp/DeleteNotes',(request,response)=>{
    database.collection(process.env.COLLECTIONNAME).deleteOne({
        id:request.query.id
    })
    response.json("Deleted Successfully")
})
