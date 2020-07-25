-------------------------------------------------------------------------------
-- ***** Create Tables *****

DROP TABLE IF EXISTS troopers;
CREATE TABLE troopers (
  id int auto_increment not NULL PRIMARY KEY,
  garrison int,
  loadout int not NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS garrisons;
CREATE TABLE garrisons (
  id INT AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  capacity INT(11) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS loadouts;
CREATE TABLE loadouts (
  id INT AUTO_INCREMENT,
  blaster VARCHAR(255) NOT NULL,
  detonator VARCHAR(11) NOT NULL,
  PRIMARY KEY (id)
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
  ship INT NOT NULL,
  trooper INT NOT NULL,
  PRIMARY KEY (ship, trooper)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS ships_droids;
CREATE TABLE ships_droids (
  ship INT NOT NULL,
  droid INT NOT NULL,
  PRIMARY KEY (ship, droid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-------------------------------------------------------------------------------
-- ***** Relationships *****

--------------------------------------------------
-- ***** troopers Relationships *****

ALTER TABLE troopers
  ADD FOREIGN KEY (garrison)
  REFERENCES garrisons(id);

ALTER TABLE troopers
  ADD FOREIGN KEY (loadout)
  REFERENCES loadouts(id);

--------------------------------------------------
-- ***** ships_troopers relationships *****


--------------------------------------------------
-- ***** ships_droids relationships *****


-------------------------------------------------------------------------------
-- ***** Initial Data *****

INSERT INTO `garrisons` (`name`, `capacity`) VALUES
("Tatooine", 10000),
("Coruscant", 100000),
("Kashyyk", 5000);

INSERT INTO `loadouts` (`blaster`, `detonator`) VALUES
("EL-16", "Thermal"),
("E-11", "Fragmentation");
