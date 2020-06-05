const express = require('express');

module.exports = () => {
    const app = express.Router();
    
	require('./routes/scores')(app);
    require('./routes/state')(app);
    require('./routes/question')(app);

	return app
}