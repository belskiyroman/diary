var path = require('path');

module.exports = {
	_pablic: path.join(__dirname, 'htdocs'),
	port: process.env.PORT || 5000,
    db: path.join(__dirname, 'db', 'db.json')
};
