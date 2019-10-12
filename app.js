var express = require('express');
var app  = express();
var bodyParser = require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({extended: false});
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Import email authentication schema/model. Email is like a class, can create and use instances of it.
const Email = require('./public/models/authorizeEmail');
// Import mongoose module

var mongoose = require('mongoose')

// Connect to the database
mongoose.connect('mongodb://test:test123@ds143594.mlab.com:43594/nodetest', {useNewUrlParser:true});  

// Create a schema - kind of like a type
var schema = new mongoose.Schema(
{
	email: String
});

// Create a model based on the schema - Model name 'Data' is going to be stored as a collection on MongoDB.
// Use this model to create new user data and push to MongoDB.
const Data = mongoose.model('Data', schema);

var obj = {name: 'Omair', age: 20};

// Set express view engine to ejs. When you request views or a template it looks in the /views folder.
app.set('view engine', 'ejs') 
app.use(express.static(__dirname + '/public'))

// app.get('/', (req, res) => res.render(__dirname + '/views/index'));

app.get('/', function(req, res)
{
	res.render(__dirname + '/views/index');	
	console.log('Rendered index.ejs')
});

app.get('/second', (req, res) => res.render(__dirname + '/views/secondPage'));

app.post('/', urlEncodedParser, function(req, res) // Here
{
	console.log('rendered POST')
	
	console.log(req.body.email)
	 
	const userObj = 
	{
		email: req.body.email,
		url: 'N/A'
	}

	console.log(req.body)

	// JWT.sign() seems to accept only objects containing an email component.
	jwt.sign({userObj}, 'secretkey', { expiresIn: '30m' } ,(err, token) => 
	{
		//Displays token for viewing purposes 
	userObj.url = `http://localhost:1000/welcome/?token=${token}`;
	//res.json({userObj});
	res.send('hi sheery');

	var transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'OhloneLibraryApp@gmail.com',
			pass: process.env.GMAIL_PW
		}
	});

	var mailOptions = 
	{
		from: 'OhloneLibraryApp@gmail.com',
		to: userObj.email,
		subject: 'NO-Reply',
		text: 'hello ' + userObj.url
	}

	transporter.sendMail(mailOptions, function(error, info) 
	{
		if (error) {
			console.log(error);
		} else {
			console.log('Email sent: ' + info.response);
		}
	});

	// Create instance of Model 'Email', assign component values.
	const email = new Email({
		email: userObj.email
	});

	// Used to save model instance - store in DB.
	email.save().then(result => {
		console.log(result);
	})
	.catch(err => console.log(err));

	//res.render(__dirname + '/views/contactSuccess', {request: req});
	
	//console.log(req.body);
});
});

app.get('/welcome', (req, res) => 
{
	//console.log(req.query.token);
	//res.json(url);
	//res.header('Authorization', `Bearer ${req.query.token}`);
	//request.post({
      //url: 'http://localhost:5000/api/summary',
    //},
    jwt.verify(req.query.token, 'secretkey', (err, authData) => 
	{
		//If error
		if(err)
		{
			//Forbidden message
			res.sendStatus(403);
		}
		else 
			return res.redirect('http://localhost:1000/second');
	});
});

function verifyToken(req, res, next) {
	//Get auth header value
	const bearerHeader = req.headers['Authorization'];
	console.log(req);
	//Check if bearer is undefined
	if(typeof bearerHeader !== 'undefined') {
		//Split at the Space
		const bearer = bearerHeader.split(' ');
		//Get token from array
		const bearerToken = bearer[1];
		//Set the Token
		req.token = bearerToken;
		//Next middleware
		next();
	}
	else 
	{
		//Forbidden
		res.sendStatus(403);
	}
}

// Pulls and displays all data stored in the database.
app.get('/displayDB', (req, res) =>
{	
	// Data.findOne({email: 'fakemail34343'}, function(error, data)
	// {
	// 	if(error)
	// 		throw error;
	// 	else if(!data)
	// 		console.log('Data not found.')
	// 	else
	// 		data.remove();
	// });

	// Email.find({}, function(error, data)
	// {
	// 	if(error)
	// 		throw error;

	// 	res.render('show', {emails: data});
	// });	

	Email.find()
	.exec()
	.then(docs => 
	{
		console.log(docs);
		res.status(200).json(docs);

	})
	.catch(err => {
		console.log(err);
		res.status(500).json({error: err});
	});
});

app.delete('/delete/:deleteID', (req, res) => 
{
	const id = req.params.deleteID;

	Email.remove({_id: id})
	.exec()
	.then(result => 
	{
		res.status(200).json(result);
	})
	.catch(err => res.status(500).json({error: err})
		);
});

// Handle invalid route requests
app.get('/*', (req, res) => res.render(__dirname + '/views/404'))

var port = 1000;

console.log('Listening on port ' + port);
app.listen(port);