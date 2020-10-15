const express = require('express');
const router = express.Router();

router.get('/me', (req, res, next) => {
	try {
		res.status(200).send(req.session);
	} catch (error) {
		next(error);
	};
});

module.exports = router;
