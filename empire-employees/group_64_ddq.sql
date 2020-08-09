-- -----------------------------------------------------------------------------
-- ***** Create Tables *****

-- Drop any leftover tables before creating the tables.
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS troopers;
DROP TABLE IF EXISTS garrisons;
DROP TABLE IF EXISTS loadouts;
DROP TABLE IF EXISTS ships;
DROP TABLE IF EXISTS droids;
DROP TABLE IF EXISTS ships_troopers;
DROP TABLE IF EXISTS ships_droids;
SET FOREIGN_KEY_CHECKS = 1;

-- Troopers page
CREATE TABLE troopers (
  id int auto_increment not NULL PRIMARY KEY,
  garrison int,
  loadout int not NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Garrisons page
CREATE TABLE garrisons (
  id INT AUTO_INCREMENT NOT NULL,
  name VARCHAR(255) NOT NULL UNIQUE,
  capacity INT(11) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Loadouts Paage
CREATE TABLE loadouts (
  id INT AUTO_INCREMENT NOT NULL,
  blaster VARCHAR(255) NOT NULL,
  detonator VARCHAR(11) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Ships page
CREATE TABLE ships (
  id int auto_increment not NULL PRIMARY KEY,
  type varchar(255) not NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Droids page
CREATE TABLE droids (
  id int auto_increment not NULL PRIMARY KEY,
  type varchar(255) not NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Manifests page: when trooper is the occupant
CREATE TABLE ships_troopers (
  ship INT NOT NULL,
  trooper INT NOT NULL,
  PRIMARY KEY (ship, trooper)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Manifests page: when droid is the occupant
CREATE TABLE ships_droids (
  ship INT NOT NULL,
  droid INT NOT NULL,
  PRIMARY KEY (ship, droid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- -----------------------------------------------------------------------------
-- ***** Relationships *****

-- ------------------------------------------------
-- ***** troopers Relationships *****

ALTER TABLE troopers
  ADD CONSTRAINT fk_troopers_garrison
  FOREIGN KEY (garrison)
  REFERENCES garrisons(id);

ALTER TABLE troopers
  ADD CONSTRAINT fk_troopers_loadout
  FOREIGN KEY (loadout)
  REFERENCES loadouts(id);

-- ------------------------------------------------
-- ***** ships_troopers relationships (Manifests)  *****

ALTER TABLE ships_troopers
  ADD CONSTRAINT fk_ships_troopers_ship
  FOREIGN KEY (ship)
  REFERENCES ships(id);

ALTER TABLE ships_troopers
  ADD CONSTRAINT fk_ships_troopers_trooper
  FOREIGN KEY (trooper)
  REFERENCES troopers(id)
  ON DELETE CASCADE;

-- ------------------------------------------------
-- ***** ships_droids relationships (Manifests) *****

ALTER TABLE ships_droids
  ADD CONSTRAINT fk_ships_droids_ship
  FOREIGN KEY (ship)
  REFERENCES ships(id);

ALTER TABLE ships_droids
  ADD CONSTRAINT fk_ships_droids_droid
  FOREIGN KEY (droid)
  REFERENCES droids(id);

-- -----------------------------------------------------------------------------
-- ***** Initial Data *****

INSERT INTO `garrisons` (id, `name`, `capacity`) VALUES
(1, "Tatooine", 10000),
(2, "Coruscant", 100000),
(3, "Kashyyk", 5000);

INSERT INTO `loadouts` (`id`, `blaster`, `detonator`) VALUES
(1, "EL-16", "Thermal"),
(2, "E-11", "Sonic"),
(3, "DC-15A", "Sonic");

INSERT INTO `ships` (`id`, `type`) VALUES
(1, "Star Destroyer"),
(2, "AT-AT"),
(3, "TIE Fighter");

INSERT INTO `droids` (`id`, `type`) VALUES
(1, "Protocol"),
(2, "Astromech"),
(3, "Battle");

INSERT INTO `troopers` (`id`, `garrison`, `loadout`) VALUES
(2187, NULL, 1),
(2188, 1, 2),
(2189, 2, 3),
(2190, 3, 3),
(2191, 3, 3),
(2199, 3, 3);

INSERT INTO `ships_droids` (`ship`, `droid`) VALUES
(1, 2),
(2, 1),
(3, 3);

INSERT INTO `ships_troopers` (`ship`, `trooper`) VALUES
(2, 2187),
(3, 2199),
(1, 2191);
