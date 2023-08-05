const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');
// const mongdb = require('mongodb')
const mongoose = require('mongoose')

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})

const userSchema = new mongoose.Schema({
  username: {type: String, required: true},
  log: [{
    description: {type: String, required: true},
    duration: {type: Number, required: true},
    date: {type: Date, required: true}
  }]
});
// const userSchema = new mongoose.Schema({
//   username: {type: String, required: true},
//   log: [{
//     description: String,
//     duration: Number,
//     date: Date
//   }]
// });

const User = mongoose.model("User", userSchema);


app.post('/api/users', async (req, res) => {
  const {username} = req.body

  let newUser = await User.findOne({username: username})
  if(newUser) return res.json({username: newUser.username, _id: newUser._id})
  newUser = new User({username: username})
  await newUser.save()
  res.json({username: newUser.username, _id: newUser._id})
});

app.get('/api/users', async (req, res) => {
  let allUsers = await User.find()
  res.send(allUsers.map(({_id, username}) => ({_id ,username})))
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  const {description, duration, date, username} = req.body
  const id = req.body[':_id']
  // const {_id} = req.params //id from url

  //probably need to add one to the date?
  let newDate = date ? new Date(date) : new Date(Date.now())

  // let validId = id.length === 24 ? true : false;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) return res.send({error: 'invalid id'})
    
    let foundUser = await User.findById({_id: id}).exec();
    if (foundUser){
      foundUser.log.push({description, duration, date: newDate})
      await foundUser.save()
      res.json({_id: id, username, date: newDate.toDateString(), duration, description})
      // res.send(foundUser)
      // res.send({
      //   _id: foundUser._id,
      //   username: foundUser.username,
      //   log: foundUser.log.map(({date, description, duration}) => (
      //     {description, duration, date: date.toDateString()}
      //   ))
      // })
    }else{
      res.send({error: "no such user_id"/*, _id: id, description, duration, date: newDate.toDateString()*/})
    }
  } catch (err) {
    res.status(500).send("server error");
  }
});

app.get('/api/users/:_id/logs', async (req, res) => {
  const {_id} = req.params
  const {from, to, limit} = req.query

  let fromDate = from && new Date(from)
  let toDate = to && new Date(to)

  console.log(_id, from, to, limit)

  try {
    if (!mongoose.Types.ObjectId.isValid(_id)) return res.send({error: 'invalid id'});

    let foundUser;

    if(limit && fromDate && toDate){
      foundUser = await User.findById({_id, log: [{date:{ $gte: fromDate, $lte: toDate}}]}).limit(limit)
      return res.send({username: foundUser.username, count: foundUser.log.length, _id: foundUser._id, log: foundUser.log.map(({description, duration, date}) => ({description, duration, date: date.toDateString()}))})
    }

    if(from)

    if (false){
    foundUser = await User.findById({_id});
      const resObj = {
        username: foundUser.username,
        count: foundUser.log.length,
        _id: foundUser._id,
        log: foundUser.log.map(({description, duration, date}) => ({description, duration, date: date.toDateString()}))
      }
      return res.send(resObj)
    }
    res.send({error: 'no such user_id'});
  } catch (error) {
    res.status(500).send("server error");
  }

})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});



// const express = require('express');
// const mongoose = require('mongoose');

// const app = express();
// const cors = require('cors');
// require('dotenv').config();

// // Import Mongo DB Atlas models
// const { Schema } = mongoose;

// // Mount the body parser as middleware
// app.use(express.json());
// app.use(express.urlencoded( {extended: true} ));

// // Connect Mongo DB Atlas
// mongoose.connect(process.env.MONGO_URI, {
//   useUnifiedTopology: true,
//   useNewUrlParser: true
// });

// const exerciseSchema = new Schema({
//     username: {
//         type: String,
//         required: true
//     },
//     description: {
//         type: String,
//         required: true
//     },
//     duration: {
//         type: Number,
//         required: true
//     },
//     date: {
//         type: Date,
//         default: Date.now()
//     }
// });
// const userSchema = new Schema({
//     username: {
//         type: String,
//         required: true
//     }
// });

// const User = mongoose.model('User', userSchema)
// const Exercise = mongoose.model('Exercise', exerciseSchema)
//   // Enable cors for FCC to test the application
// app.use(cors());

// // Mount the middleware to serve the style sheets in the public folder 
// app.use(express.static('public'));

// // Print to the console information about each request made
// app.use((req, res, next) => {
//   console.log("method: " + req.method + "  |  path: " + req.path + "  |  IP - " + req.ip);
//   next();
// });

// /**
//  * ****************************
//  * ROUTES - GET & POST requests
//  * ****************************
//  */

// // PATH / (root)
// // GET: Display the index page for
// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/views/index.html');
// });

// // PATH /api/users/ Requests
// // GET: Show the contents of the User model
// // POST: Store user into User model
// app.route('/api/users').get((req, res) => {
//   User.find({}, (error, data) => {
//     //console.log(data);
//     res.json(data);
//   });
// }).post((req, res) => {
//   // Get username input into form
//   const potentialUsername = req.body.username;
//   console.log("potential username:", potentialUsername);

//   // Check to see if the username has already been entered
//   User.findOne({username: potentialUsername}, (error, data) => {
//     if (error) {
//       res.send("Unknown userID");
//       return console.log(error);
//     }

//     if (!data) { // If username is not stored yet, create and save a User object
//       const newUser = new User({
//         username: potentialUsername
//       });

//       // Save the user
//       newUser.save((error, data) => {
//         if (error) return console.log(error);
//         // Remove the key-value pair associated with the key __v
//         const reducedData = {
//           "username": data.username, 
//           "_id": data._id
//         };
//         res.json(reducedData);
//         console.log(reducedData);
//       });
//     } else { // If username is already stored, send a message to the user
//       res.send(`Username ${potentialUsername} already exists.`);
//       console.log(`Username ${potentialUsername} already exists.`);
//     }
//   });
// });

// // PATH /api/users/:_id/exercises
// // POST: Store new exercise in the Exercise model 
// app.post('/api/users/:_id/exercises', (req, res) => {
//   // Get data from form
//   const userID = req.body[":_id"] || req.params._id;
//   const descriptionEntered = req.body.description;
//   const durationEntered = req.body.duration;
//   const dateEntered = req.body.date;

//   // Print statement for debugging
//   console.log(userID, descriptionEntered, durationEntered, dateEntered);

//   // Make sure the user has entered in an id, a description, and a duration
//   // Set the date entered to now if the date is not entered
//   if (!userID) {
//     res.json("Path `userID` is required.");
//     return;
//   }
//   if (!descriptionEntered) {
//     res.json("Path `description` is required.");
//     return;
//   }
//   if (!durationEntered) {
//     res.json("Path `duration` is required.");
//     return;
//   }

//   // Check if user ID is in the User model
//   User.findOne({"_id": userID}, (error, data) => {
//     if (error) {
//       res.json("Invalid userID");
//       return console.log(error);
//     }
//     if (!data) {
//       res.json("Unknown userID");
//       return;
//     } else {
//       console.log(data);
//       const usernameMatch = data.username;
      
//       // Create an Exercise object
//       const newExercise = new Exercise({
//         username: usernameMatch,
//         description: descriptionEntered,
//         duration: durationEntered
//       });

//       // Set the date of the Exercise object if the date was entered
//       if (dateEntered) {
//         newExercise.date = dateEntered;
//       }

//       // Save the exercise
//       newExercise.save((error, data) => {
//         if (error) return console.log(error);

//         console.log(data);

//         // Create JSON object to be sent to the response
//         const exerciseObject = {
//           "_id": userID,
//           "username": data.username,
//           "date": data.date.toDateString(),
//           "duration": data.duration,
//           "description": data.description
//         };

//         // Send JSON object to the response
//         res.json(exerciseObject);

//       });
//     }
//   });
// });


// // PATH /api/users/:_id/logs?[from][&to][&limit]
// app.get('/api/users/:_id/logs', (req, res) => {
//   const id = req.body["_id"] || req.params._id;
//   var fromDate = req.query.from;
//   var toDate = req.query.to;
//   var limit = req.query.limit;

//   console.log(id, fromDate, toDate, limit);

//   // Validate the query parameters
//   if (fromDate) {
//     fromDate = new Date(fromDate);
//     if (fromDate == "Invalid Date") {
//       res.json("Invalid Date Entered");
//       return;
//     }
//   }

//   if (toDate) {
//     toDate = new Date(toDate);
//     if (toDate == "Invalid Date") {
//       res.json("Invalid Date Entered");
//       return;
//     }
//   }

//   if (limit) {
//     limit = new Number(limit);
//     if (isNaN(limit)) {
//       res.json("Invalid Limit Entered");
//       return;
//     }
//   }

//   // Get the user's information
//   User.findOne({ "_id" : id }, (error, data) => {
//     if (error) {
//       res.json("Invalid UserID");
//       return console.log(error);
//     }
//     if (!data) {
//       res.json("Invalid UserID");
//     } else {

//       // Initialize the object to be returned
//       const usernameFound = data.username;
//       var objToReturn = { "_id" : id, "username" : usernameFound };

//       // Initialize filters for the count() and find() methods
//       var findFilter = { "username" : usernameFound };
//       var dateFilter = {};

//       // Add to and from keys to the object if available
//       // Add date limits to the date filter to be used in the find() method on the Exercise model
//       if (fromDate) {
//         objToReturn["from"] = fromDate.toDateString();
//         dateFilter["$gte"] = fromDate;
//         if (toDate) {
//           objToReturn["to"] = toDate.toDateString();
//           dateFilter["$lt"] = toDate;
//         } else {
//           dateFilter["$lt"] = Date.now();
//         }
//       }

//       if (toDate) {
//         objToReturn["to"] = toDate.toDateString();
//         dateFilter["$lt"] = toDate;
//         dateFilter["$gte"] = new Date("1960-01-01");
//       }

//       // Add dateFilter to findFilter if either date is provided
//       if (toDate || fromDate) {
//         findFilter.date = dateFilter;
//       }

//       // console.log(findFilter);
//       // console.log(dateFilter);

//       // Add the count entered or find the count between dates
//       Exercise.count(findFilter, (error, data) => {
//         if (error) {
//           res.json("Invalid Date Entered");
//           return console.log(error);
//         }
//         // Add the count key 
//         var count = data;
//         if (limit && limit < count) {
//           count = limit;
//         }
//         objToReturn["count"] = count;


//         // Find the exercises and add a log key linked to an array of exercises
//         Exercise.find(findFilter, (error, data) => {
//           if (error) return console.log(error);

//           console.log(data);

//           var logArray = [];
//           var objectSubset = {};
//           var count = 0;

//           // Iterate through data array for description, duration, and date keys
//           data.forEach(function(val) {
//             count += 1;
//             if (!limit || count <= limit) {
//               objectSubset = {};
//               objectSubset.description = val.description;
//               objectSubset.duration = val.duration;
//               objectSubset.date = val.date.toDateString();
//               console.log(objectSubset);
//               logArray.push(objectSubset);
//             }
//           });

//           // Add the log array of objects to the object to return
//           objToReturn["log"] = logArray;

//           // Return the completed JSON object
//           res.json(objToReturn);
//         });

//       });

//     }
//   });
// });

// // ----------------
// // ADDITIONAL PATHS (not required for the FreeCodeCamp project)

// // PATH /api/exercises/
// // Display all of the exercises in the Mongo DB model titled Exercise
// app.get('/api/exercises', (req, res) => {
//   Exercise.find({}, (error, data) => {
//     if (error) return console.log(error);
//     res.json(data);
//   })
// });

// // Listen on the proper port to connect to the server 
// const listener = app.listen(process.env.PORT || 3000, () => {
//   console.log('Your app is listening on port ' + listener.address().port);
// })

// const express = require('express')
// const app = express()
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const mongoose = require('mongoose');
// const {Schema} = mongoose;
// const moment = require('moment');
// require('dotenv').config()

// app.use(bodyParser.urlencoded({extended:false}));
// app.use(cors())
// app.use(express.static('public'))
// app.use(({ method, url, query, params, body }, res, next) => {
//   console.log('>>> ', method, url);
//   console.log(' QUERY:', query);
//   console.log(' PRAMS:', params);
//   console.log('  BODY:', body);
//   const _json = res.json;
//   res.json = function (data) {
//     console.log(' RESLT:', JSON.stringify(data, null, 2));
//     return _json.call(this, data);
//   };
//   console.log(' ----------------------------');
//   next();
// });
// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/views/index.html')
// });

// //Mongoose Config
// mongoose.connect(process.env.MONGO_URI,{ useNewUrlParser: true, useUnifiedTopology: true });

// const userSchema = new Schema({
//   username:{
//     type:String,
//     required:true
//   },
//   exercise:[{
//     description: String,
//     duration: Number,
//     date: String,
//   }]
// });
// const User = mongoose.model('User',userSchema);


// //URI handling
// app.post('/api/users',function(req,res){
//   if(req.body.username != undefined){
//     let username = req.body.username;
//     let user = new User({username});
//     user.save(function(err,data){
//       if(err)res.json({error:"Mongo error"})
//       else{
//         const {username,_id} = data;
//         res.json({username,_id});
//       }
//     });
//   }else{
//     res.json({error:"invalid data"})
//   }
// });

// app.get('/api/users',function(req,res){
//     User.find({}).exec(function(err,data){
//       if(err)res.json({error:"Mongo error"})
//       else{
//         res.json(data);
//       }
//     });
// });

// app.post('/api/users/:_id/exercises',function(req,res){
//   if(req.body.description!=undefined && req.body.duration!=undefined && req.params._id!=undefined){
//     let {description,duration,date} = req.body;
//     const {_id} = req.params;

//     if(date===undefined || date == "")
//       date = new Date().toDateString();
//     else
//       date = new Date(date).toDateString();
      
//     // console.log({description,duration,date});
//     User.findByIdAndUpdate(_id,{$push:{exercise:{description,duration,date}}},{new:true},function(err,data){
//       if(err)res.json({error:"Mongo Error"});
//       else{
//         User.find({_id:_id}).slice('exercise', -1).exec(function(err,data){
//           if(err)res.json({error:"Mongo Error"});
//           else{
//             let {username,_id,exercise:[{description,duration,date}]} = data[0];
//             res.json({username,_id,description,duration,date});
//           }
//         });
//       }
//     })
//   }else{
//     res.json({error:"invalid data"})
//   }
// });


// app.get('/api/users/:_id/logs',function(req,res){
//   if(req.params._id!=undefined){
//     const {_id} = req.params;
//     const {from,to,limit} = req.query;
//     User.findById(_id,'username _id exercise.description exercise.duration exercise.date',function(err,data){
//       if(err)res.json({error:"Mongo Error"});
//       else{
//         let {username,_id,exercise:log} = data;

//         if(from!=undefined && to!=undefined){
//           log = log.filter((ele)=>{
//             let eleDate = (new Date(ele.date)).getTime();
//             let fromDate = (new Date(from+" 00:00:00")).getTime();
//             let toDate = (new Date(to+" 00:00:00")).getTime();

//             return eleDate >= fromDate && eleDate <= toDate;
//           })
//         }
//         if(limit!=undefined){
//           log = log.slice(0,limit);
//         }
        
//         log = log.map((ele)=>{
//           return {description:ele.description,duration:ele.duration,date:new Date(ele.date).toDateString()};
//         })

//         let count = 0;
//         if(log!=undefined)
//           count = log.length
//         res.json({username,_id,log,count});
//       }
//     });
//   }else{
//     res.json({error:"invalid data"})
//   }
// });


// const listener = app.listen(process.env.PORT || 3000, () => {
//   console.log('Your app is listening on port ' + listener.address().port)
// })