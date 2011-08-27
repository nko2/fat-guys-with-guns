module.exports = function(app) {
	app.get('/phone_connect', function(req, res){
	  res.render('phone_connect', {
		title: 'Express'
	  });
	});

	app.post('/phone_connect', function(req, res){
	  var code = res.body.code;

	  res.cookie('code', code, {
        httpOnly: false
      });

	  res.render('phone_connect', {
		title: 'Express'
	  });
	});

}