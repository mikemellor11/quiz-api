const express = require('express');

module.exports = () => {
    const app = express.Router();
    
	require('./routes/scores')(app);
    require('./routes/state')(app);
    require('./routes/question')(app);

    app.get('/', (req, res) => {
        res.json({});
    });

	return app
}