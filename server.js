const http = require('http');
const datetime = require('node-datetime');
const hostname = '127.0.0.1';
const LocalStrategy = require('passport-local');
const port = 3000;
const PORT = process.env.PORT
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const session = require('express-session');
const nodemailer = require("nodemailer");
const ObjectID = require('mongodb').ObjectID;
const express = require('express');

const passport = require('passport');
const app = express();
const mongo = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const mongodb = require('mongodb');
const bodyparser = require('body-parser')
process.env.DB='mongodb://shayolaw:shayzzel97@ds343985.mlab.com:43985/room';
process.env.DATABASE='mongodb://shayolaw:shayzzel97@ds343985.mlab.com:43985/';
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use('/Images',express.static(__dirname + "/Images"));
app.use('/',express.static(__dirname + "/"));
process.env.SESSION_SECRET=2;
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
}));



app.use(passport.initialize());
app.use(passport.session());

app.route('/')
.get(function(req,res){
	res.sendFile(__dirname+'/login.html')
})
mongo.connect(process.env.DB,function(err,db){
    if(err) {
        console.log('Database error: ' + err);
    } else {
   
        console.log('Successful database connection');
        
        passport.serializeUser((user, done) => {
   		done(null, user._id)});

   		passport.deserializeUser((id, done) => {
        db.collection('staff').findOne(
            {_id: new ObjectID(id)},
            (err, doc) => {
            	console.log('found')
                done(null, doc);
            }
        );
    });
   		passport.use(new LocalStrategy(
  			function(username, password, done) {
  			console.log('passport side')
    		db.collection('staff').findOne({ username: username }, function (err, user) {
      		console.log('User '+ username +' attempted to log in.');
      		if (err) { return done(err); }
      		if (!user) { return done(null, false); }
      		if (password !== user.password) { return done(null, false); }
      		console.log(user);
      		return done(null, user);
    });
  }
));
   	} })

        //serialization and app.listen
 function ensureAuthenticated(req, res, next) {
 	console.log('here');
  if (req.isAuthenticated()) {
  		console.log('is authenticate');
      return next();
  }
  console.log('not authenticate')
  res.redirect('/');
};

 


app.route('/profile')
.get(ensureAuthenticated,function(req,res){
	res.sendFile(__dirname+'/staff.html')
})
app.route('/register')
  .post((req, res, next) => {
      db.collection('staff').findOne({ username: req.body.username }, function (err, user) {
          if(err) {
              next(err);
          } else if (user) {
              res.redirect('/');
          } else {
              db.collection('staff').insertOne(
                {username: req.body.username,
                 password: req.body.password,
                 position:req.body.position,
                 fistname:req.body.first},

                (err, doc) => {
                    if(err) {
                        res.redirect('/');
                    } else {
                        next(null, user);
                    }
                }
              )
          }
      })},
    passport.authenticate('local', { failureRedirect: '/' }),
    (req, res, next) => {
    	console.log(req.user);
        res.redirect('/profile');
    }
);

app.route('/login')
.post(passport.authenticate('local', { failureRedirect: '/' }),function(req,res){
	res.redirect('/profile');
});
function recycle(x,y,z){

mongoose.connect(process.env.DB,(err,db)=>{
	var d =[];
				var dt = datetime.create(x);
				var first = dt.format('Y/m/d');
				d.push(first);
				for(var i=1;i<y;i++){
					dt.offsetInDays(1);
					var ay = dt.format('Y/m/d');
					d.push(ay);
				}
				room.findOne({names:z},function(err,data){
					var select =[]
					for(var j = 0;j<d.length;j++){
						if(data.selected.length==0){
						console.log('not in anywhere');
						var sect ={}
									sect.date = d[j]
									sect.count=1;
									select.push(sect);
					}
					else{
						var count=0;
						for(var k = 0;k<data.selected.length;k++){
							
							var sect ={}
							sect.date = data.selected[k].date
							if(d[j]==data.selected[k].date){
								sect.count=Number(data.selected[k].count) + 1;
								if(sect.count==data.number){
									data.unavailable.push(sect.date);
								}
								console.log('found it in selected so saved'+d[j]+'is equal to'+data.selected[k].date);
								select.push(sect)
								}
							else{
								
								count=count+1
								if(count==data.selected.length){
									console.log('didnt find it in selected so saved'+d[j]);
									var sect ={}
									sect.date = d[j]
									sect.count=1;
									select.push(sect);
								}
							}
					}
						}	

					
					}
					for(var l=0;l<data.selected.length;l++){
						var lcount=0
						for(var m=0;m<select.length;m++){
							if(data.selected[l].date!=select[m].date){
								lcount=lcount+1;
								if(lcount==select.length){
									select.push(data.selected[l])
								}

							}
						}
					}
					data.selected=select;
					data.save();
					});
	
})
}
var Schema = mongoose.Schema;
var Res = mongoose.Schema;
var reserves = new Schema({
names : String,
address:Number,
email:String,
room:String,
date:Date,
duration:Number
});
var rooms = new Schema({
names : String,
price : {type:Number,default:1000},
number:Number,
unavailable:{type:Array},
max:Number,
facilities:Array,
size:String,
bed:String,
selected:Array,
img:String

})
var room = mongoose.model('room',rooms)
var reserve = mongoose.model('reserve',reserves);
app.use(bodyparser.urlencoded({ extended: true }));
app.route('/room/')
.post(upload.single('pic'),function(req,res){
const names = req.body.names;
const filename = req.file.filename;
const price = req.body.price;
const max = req.body.max;
const size = req.body.sizes;
const bed = req.body.bed;
const number = req.body.number;
mongoose.connect(process.env.DB,(err,db)=>{
	if(err){}
	else{
		console.log('Database Connected!');
		var newRoom= new room({
			names:names,
			price:price,
			number:number,
			max:max,
			size:size,
			bed:bed,
			img:filename

		});
		newRoom.save(function(err){
			if(err){}
				else{
					res.json(newRoom)

				}
		})
	}

})

})
.get(function(req,res){
	const names=req.query.names;
	const price = req.query.price;
	const max = req.query.max;
	const size = req.query.sizes;
	const bed = req.query.bed;
	const number = req.query.number;
	mongoose.connect(process.env.DB,(err,db)=>{
		if(err){}
		else{
			room.findOne({names:names},function(err, doc){
				if(err){
				}
				else{
					console.log(doc)
					doc.price=price;
					doc.max=max;
					doc.bed=bed;
					doc.size=size;
					doc.number=number;
					doc.save()
					res.json(doc);
					
				}

			})
		}
	})

})
.delete(function(req,res){
	const names = req.body.names;
	var data;
	mongoose.connect(process.env.DB,(err,db)=>{
		if(err){
			res.send('wow');
		}
		else{
			room.findOneAndRemove({names:names},function(err){
				if(err){

				}
				else{
					var message = 'Successfully Deleted ' +names
					console.log(message);
					res.send(message);
				}
			})

	};
})
});

app.route('/book')
.get(function(req,res){
	res.sendFile(__dirname+'/availability.html');
});
app.route('/availability')
	.get(function(req,res){
		var d =[];
		const date = req.query.date;
		const duration = (Number(req.query.duration));
		var dt = datetime.create(date);
		var first = dt.format('Y/m/d');
		d.push(first);
		console.log(dt);
		for(var i=1;i<duration;i++){
			dt.offsetInDays(1);
			var ay = dt.format('Y/m/d');
			d.push(ay);
		}
		
		console.log(d);
		const adults = Number(req.query.adults);
		const child = Number(req.query.child);
		var number = adults + child - 1;
		
		mongoose.connect(process.env.DB,(err,db)=>{
			if(err){}
			else{
				room.find({max:{$gt:number}},function(err,data){
				var available=[]
				console.log(data)
				for (var i = data.length - 1; i >= 0; i--) {
					acount=0;
					for (var j = 0;j<=data[i].unavailable.length-1; j++ ){
						var count = 0;
						for( var k = 0; k<d.length; k++){
							console.log(d[k]+' is equal to '+data[i].unavailable[j])
							if(d[k] == data[i].unavailable[j]){
								k=d.length-1;
								j=data[i].unavailable.length-1;
							}
							else{
								count++;
								if(count==d.length){
									acount++;
								}
							}
						}

					}
					if(acount==data[i].unavailable.length||data[i].unavailable.length==0){
							var act = {}
							dates1=[];
							dates1.push(d[0]);
							dates1.push(duration);
							act.dates= dates1
							act.dat=data[i]
							available.push(act);
							console.log(act)
						}
				}

					if(available.length==0){
						res.send('No available rooms for those dates')
					}
					else{
					console.log(available);
					res.send(available);
					}
				})
			}
		})
	})
app.route('/select')
	.get(function(req,res){
		res.sendFile(__dirname+'/reservation.html');
	})
app.route('/reservation')
.get(function(req,res){
	const names=req.query.names
	const date = req.query.date;
	const duration = req.query.duration;
	const slip=[];
	var d = {}
	d.date=date;
	d.duration=duration
	mongoose.connect(process.env.DB,(err,db)=>{
		if(err){}
		else{
			room.findOne({names:names},function(err,data){
				slip.push(data);
				slip.push(d);
				res.send(slip)
			})
		}
	})
})
app.route('/finalize')
.get(function(req,res) {
		const rooms = req.query.room;
		const duration= req.query.duration;
		const date = req.query.date;
		var date1 = datetime.create(date);
		date1.offsetInDays(1);
		var reald = date1.format('Y/m/d');
		const first = req.query.first;
		const last = req.query.last;
		const name = first+' '+last
		const email = req.query.email;
		process.env.NODE_TLS_REJECT_UNAUTHORIZED='0'
  		var transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
     port: 587,
     secure: false,
    auth: {
      user: 'shayolaw', // generated ethereal user
      pass: 'shayzzel' // generated ethereal password
    }
  });

  


		const address = req.query.address;	// body...
		mongoose.connect(process.env.DB,(err,db)=>{
			if(err){}
			else{
				var newRes = new reserve({room:rooms,duration:duration,names:name,date:reald,email:email,address:address});
				newRes.save();
				var d =[];
				var dt = datetime.create(date);
				var first = dt.format('Y/m/d');
				d.push(first);
				for(var i=1;i<duration;i++){
					dt.offsetInDays(1);
					var ay = dt.format('Y/m/d');
					d.push(ay);
				}
				room.findOne({names:rooms},function(err,data){
					var select =[]
					for(var j = 0;j<d.length;j++){
						if(data.selected.length==0){
						console.log('not in anywhere');
						var sect ={}
									sect.date = d[j]
									sect.count=1;
									select.push(sect);
					}
					else{
						var count=0;
						for(var k = 0;k<data.selected.length;k++){
							
							var sect ={}
							sect.date = data.selected[k].date
							if(d[j]==data.selected[k].date){
								sect.count=Number(data.selected[k].count) + 1;
								if(sect.count==data.number){
									data.unavailable.push(sect.date);
								}
								console.log('found it in selected so saved'+d[j]+'is equal to'+data.selected[k].date);
								select.push(sect)
								}
							else{
								
								count=count+1
								if(count==data.selected.length){
									console.log('didnt find it in selected so saved'+d[j]);
									var sect ={}
									sect.date = d[j]
									sect.count=1;
									select.push(sect);
								}
							}
					}
						}	

					
					}
					for(var l=0;l<data.selected.length;l++){
						var lcount=0
						for(var m=0;m<select.length;m++){
							if(data.selected[l].date!=select[m].date){
								lcount=lcount+1;
								if(lcount==select.length){
									select.push(data.selected[l])
								}

							}
						}
					}
					data.selected=select;
					data.save();
					});
				
				res.json(newRes)
let mailOptions = {
    from: 'shayolaw@gmail.com', // sender address
    to: email, // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello "+first+" your reservation has been approved and confirmed, and your id "+newRes._id+" for "+newRes.duration+" nights starting on "+newRes.date,// plain text body
    html: "<b><h1>Hemad Hotel</h1><h2>Hello "+newRes.names+"</h2></p>your reservation has been approved and confirmed, and your id "+newRes._id+" for "+newRes.duration+" nights starting on "+newRes.date+"</p></b>" // html body
  };

  // send mail with defined transport object
   transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId)
    });
			}
			})
		})
		
app.route('/remove-reservation')
.delete(function(req,res){
	const id = req.body._id;
	mongoose.connect(process.env.DB,(err,db)=>{
	reserve.findById(id,function(err,data){
		var date = data.date;
		var duration = data.duration;
		var names = data.room;
		console.log(duration);
	reserve.findOneAndRemove({_id:id},function(err,doc){
		if(err){

		}
		else{
			var e =[];
				var et = datetime.create(date);
				var first = et.format('Y/m/d');
				e.push(first);
				for(var i=1;i<duration;i++){
					et.offsetInDays(1);
					var eay = et.format('Y/m/d');
					e.push(eay);
				}
			room.findOne({names:names},function(err,doc){
				var selec =[];
				for(var j=0;j<e.length;j++){
					
					var sec={}
					sec.date=e[j]
					for(var k=0;k<doc.selected.length;k++){
						if(e[j]==doc.selected[k].date){
							if(doc.selected[k].count==doc.number){
								var un = []
								for(var a=0;a<doc.unavailable.length;a++){
									if(doc.unavailable[a]!=doc.selected[k].date){
										un.push(doc.unavailable[a]);
									}
								}
							doc.unavailable=un;
							}
							sec.count= doc.selected[k].count-1
							console.log('reduced count by 1 +'+sec.count+' instead of' + doc.selected[k].count)
							selec.push(sec);
							
						}
					}
				}
				for(var l=0;l<doc.selected.length;l++){
						var lcount=0
						for(var m=0;m<selec.length;m++){
							if(doc.selected[l].date!=selec[m].date){
								lcount=lcount+1;
								if(lcount==selec.length){
									selec.push(doc.selected[l])
								}

							}
						}
					}
				doc.selected=selec;
				console.log('saving');
				doc.save()
			});
			
			res.send('Reservation canceled');
		}
	})
	})
	})
})
app.route('/update')
.get(function(req,res){
	var id = req.query.id;
	var rooms = req.query.names;
		var duration= req.query.duration;
		var date = req.query.date;
	mongoose.connect(process.env.DB,(err,db)=>{
	reserve.findOne({_id:id},function(err,datae){
		console.log('found reservation');
		if(err){

		}
		else{
			const old=datae.date;
			const dura = datae.duration;
			const fine = datae.room;
			recycle(date,duration,rooms);
			var e =[];
				var et = datetime.create(old);
				var first = et.format('Y/m/d');
				e.push(first);
				for(var i=1;i<dura;i++){
					et.offsetInDays(1);
					var eay = et.format('Y/m/d');
					e.push(eay);
				}
			datae.date=date;
			datae.duration=duration;
			datae.room=rooms;
			datae.save()
			room.findOne({names:fine},function(err,doc){
				console.log(fine);
				var selec =[];
				for(var j=0;j<e.length;j++){
					
					var sec={}
					sec.date=e[j]
					console.log(sec.date)
					for(var k=0;k<doc.selected.length;k++){
						if(e[j]==doc.selected[k].date){
							if(doc.selected[k].count==doc.number){
								var un = []
								for(var a=0;a<doc.unavailable.length;a++){
									if(doc.unavailable[a]!=doc.selected[k].date){
										un.push(doc.unavailable[a]);
									}
								}
							doc.unavailable=un;
							}
							sec.count= doc.selected[k].count-1
							console.log('reduced count by 1 +'+sec.count)
							selec.push(sec);
							
						}
					}
				}
				for(var l=0;l<doc.selected.length;l++){
						var lcount=0
						for(var m=0;m<selec.length;m++){
							if(doc.selected[l].date!=selec[m].date){
								lcount=lcount+1;
								if(lcount==selec.length){
									selec.push(doc.selected[l])
								}

							}
						}
					}
				doc.selected=selec;
				console.log('saving');
				doc.save()
			})
			res.send(datae);
		}

	})

							
	})

});
app.route('/check-reserve')
.get(function(req,res){
	const id = req.query.id;
	mongoose.connect(process.env.DB,(err,db)=>{
		reserve.findById(id,function(err,data){
			if(err){}
			else{
				if(data==null){
					res.send('No Reservation found');
				}
				else{
					res.json(data)

				}

			}
		})
	})
})
app.route('/get-room')
.get(function(req,res){
	console.log('getting');
	mongoose.connect(process.env.DB,(err,db)=>{
		room.find({},function(err,data){
			if(err){}
			else{
				if(data==[]){
					res.send('No rooms');
				}
				else{
					res.send(data);
					console.log(data);
				}
			}
		})
	})
})
app.route('/get-rooms/:id')
.get(function(req,res){
	var id = req.params.id;
	console.log('in the db');
	mongoose.connect(process.env.DB,(err,db)=>{
	room.findById(id,function(err,data){

		if(err){}
		else{
		res.send(data)
		console.log(data.img);
		
	}
		});
	})
})

app.listen(PORT, () => {
	console.log(`Hello Server running at http://${hostname}:${port}/`);
});