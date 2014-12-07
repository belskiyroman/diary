var path = require('path');

module.exports = {
	_pablic: path.join(__dirname, 'htdocs'),
	port: 3000,
    db: path.join(__dirname, 'db', 'db.json')
};
