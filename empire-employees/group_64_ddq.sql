-------------------------------------------------------------------------------
-- ***** Create Tables *****

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS troopers;
DROP TABLE IF EXISTS garrisons;
DROP TABLE IF EXISTS loadouts;
DROP TABLE IF EXISTS ships;
DROP TABLE IF EXISTS droids;
DROP TABLE IF EXISTS ships_troopers;
DROP TABLE IF EXISTS ships_droids;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE troopers (
  id int auto_increment not NULL PRIMARY KEY,
  garrison int,
  loadout int not NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE garrisons (
  id INT AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  capacity INT(11) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE loadouts (
  id INT AUTO_INCREMENT,
  blaster VARCHAR(255) NOT NULL,
  detonator VARCHAR(11) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE ships (
  id int auto_increment not NULL PRIMARY KEY,
  type varchar(255) not NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE droids (
  id int auto_increment not NULL PRIMARY KEY,
  type varchar(255) not NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE ships_troopers (
  ship INT NOT NULL,
  trooper INT NOT NULL,
  PRIMARY KEY (ship, trooper)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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

ALTER TABLE ships_troopers
  ADD FOREIGN KEY (ship)
  REFERENCES ships(id);

ALTER TABLE ships_troopers
  ADD FOREIGN KEY (trooper)
  REFERENCES troopers(id);

--------------------------------------------------
-- ***** ships_droids relationships *****

ALTER TABLE ships_droids
  ADD FOREIGN KEY (ship)
  REFERENCES ships(id);

ALTER TABLE ships_droids
  ADD FOREIGN KEY (droid)
  REFERENCES droids(id);

-------------------------------------------------------------------------------
-- ***** Initial Data *****

INSERT INTO `garrisons` (id, `name`, `capacity`) VALUES
(1, "Tatooine", 10000),
(2, "Coruscant", 100000),
(3, "Kashyyk", 5000);

INSERT INTO `loadouts` (`id`, `blaster`, `detonator`) VALUES
(1, "EL-16", "Thermal"),
(2, "E-11", "Fragmentation");
