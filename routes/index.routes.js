module.exports = app => {

	let userRoute = require('./user/user.routes')
	let upload = require("./upload.routes")	


	
	app.use('/api/v1/user', userRoute)
	app.use('/api/v1/upload', upload)
	
}
