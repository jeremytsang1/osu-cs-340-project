DROP TABLE IF EXISTS troopers;
CREATE TABLE troopers (
  id int auto_increment not NULL PRIMARY KEY,
  garrison int,
  loadout int not NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS garrisons;
CREATE TABLE garrisons (
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS loadouts;
CREATE TABLE loadouts (
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS ships;
CREATE TABLE ships (
  id int auto_increment not NULL PRIMARY KEY,
  type varchar(255) not NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS droids;
CREATE TABLE droids (
  id int auto_increment not NULL PRIMARY KEY,
  type varchar(255) not NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS ships_troopers;
CREATE TABLE ships_troopers (
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS ships_droids;
CREATE TABLE ships_droids (
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE troopers
  FOREIGN KEY troopers(garrison)
  REFERENCES garrisons(id)

  -- FOREIGN KEY loadout
  -- REFERENCES loadouts(id)