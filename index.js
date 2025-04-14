const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = process.env.PORT || 3000;

const db = mysql.createConnection({
  user: 'read_only_user',
  password: '',
  database: 'bob_ross_db',
  socketPath: '/var/run/mysqld/mysqld.sock'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ', err.stack);
    return;
  }
  console.log('Connected to the MySQL database as if', db.threadId);
});

const validColorColumns = [
  'Alizarin_Crimson', 'Black_Gesso', 'Bright_Red', 'Burnt_Umber',
  'Cadmium_Yellow', 'Dark_Sienna', 'Indian_Red', 'Indian_Yellow',
  'Liquid_Black', 'Liquid_Clear', 'Midnight_Black', 'Phthalo_Blue',
  'Phthalo_Green', 'Prussian_Blue', 'Sap_Green', 'Titanium_White',
  'Van_Dyke_Brown', 'Yellow_Ochre'
];

const validSubjectColumns = [
  'APPLE_FRAME', 'AURORA_BOREALIS', 'BARN', 'BEACH', 'BOAT', 'BRIDGE', 'BUILDING', 'BUSHES', 'CABIN',
  'CACTUS', 'CIRCLE_FRAME', 'CIRRUS', 'CLIFF', 'CLOUDS', 'CONIFER', 'CUMULUS', 'DECIDUOUS',
  'DIANE_ANDRE', 'DOCK', 'DOUBLE_OVAL_FRAME', 'FARM', 'FENCE', 'FIRE', 'FLORIDA_FRAME',
  'FLOWERS', 'FOG', 'FRAMED', 'GRASS', 'GUEST', 'HALF_CIRCLE_FRAME', 'HALF_OVAL_FRAME', 'HILLS',
  'LAKE', 'LAKES', 'LIGHTHOUSE', 'MILL', 'MOON', 'MOUNTAIN', 'MOUNTAINS', 'NIGHT', 'OCEAN',
  'OVAL_FRAME', 'PALM_TREES', 'PATH', 'PERSON', 'PORTRAIT', 'RECTANGLE_3D_FRAME', 'RECTANGULAR_FRAME',
  'RIVER', 'ROCKS', 'SEASHELL_FRAME', 'SNOW', 'SNOWY_MOUNTAIN', 'SPLIT_FRAME', 'STEVE_ROSS',
  'STRUCTURE', 'SUN', 'TOMB_FRAME', 'TREE', 'TREES', 'TRIPLE_FRAME', 'WATERFALL', 'WAVES',
  'WINDMILL', 'WINDOW_FRAME', 'WINTER', 'WOOD_FRAMED'
];

// Route to fetch all episodes (with optional filtering via query params)
app.get('/episodes', (req, res) => {
  const { color, subject, month } = req.query;

  let sql = 'SELECT * FROM episode_data WHERE 1=1';
  const params = [];

  // Handle multiple color filters
  if (color) {
    const colors = color.split(',').map(c => c.trim());
    const validColors = colors.filter(c => validColorColumns.includes(c));
    
    if (validColors.length > 0) {
      validColors.forEach(c => {
        sql += ` AND \`${c}\` = 1`;
      });
    } else {
      return res.status(400).json({ error: 'Invalid color filter' });
    }
  }

  // Handle multiple subject filters
  if (subject) {
    const subjects = subject.split(',').map(s => s.trim().toUpperCase());
    const validSubjects = subjects.filter(s => validSubjectColumns.includes(s));

    if (validSubjects.length > 0) {
      validSubjects.forEach(s => {
        sql += ` AND \`${s}\` = 1`;
      });
    } else {
      return res.status(400).json({ error: 'Invalid subject filter' });
    }
  }

  // Handle month filter
  if (month) {
    sql += ' AND MONTH(STR_TO_DATE(TRIM(air_date), "%d-%b-%y")) = ?';
    params.push(parseInt(month));
  }

  // Execute the query
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error running query: ', err);
      return res.status(500).send('Error retrieving data');
    }
    res.json(results);
  });
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
