LOAD DATA LOCAL INFILE '/mnt/c/Users/jacob/Documents/GitHub/atlas-the-joy-of-painting-api/episode_data.csv'
INTO TABLE episode_data
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"' 
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;
