/*
	Examples of queries I might need later. 
*/

/********************************************************************************************************************
	Create a schema - type/blueprint for DB
	ID is created automatically as a default component. 
	--v -> version is also created by default. 
	 */

var schema = new mongoose.Schema(
{
	email: String
});

// Create a model based on the schema - Model name 'Data' is going to be stored as a collection on MongoDB.
// Use this model to create new user data and push to MongoDB.
var Data = mongoose.model('Data', schema);

/********************************************************************************************************************
// Search by ID and return the object if found. */

app.get('/:findById', (req, res) => 
{	
	const id = req.params.findById;
	Email.findById(id)
	.exec()
	.then(doc => {
		res.send('Found! ' + doc.email); // can use doc.component(eg, .email)
	})
	.catch(err => 
		{
			console.log(err);
			res.status(500).json({error: err});
		});

});

// ********************************************************************************************************************
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

	Data.find({}, function(error, data)
	{
		if(error)
			throw error;

		res.render('show', {emails: data});
	});	
});

// ************************************************************************************************************************
app.get('/jsonTest', (req, res) => res.end(JSON.stringify(obj)));