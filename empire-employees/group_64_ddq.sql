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

-- Troopers page: which trooper has which garrison and loadout.
INSERT INTO `troopers` (`id`, `garrison`, `loadout`) VALUES
(2187, NULL, 12),
(2188, 1, 53),
(2189, 2, 82),
(2190, 3, 28),
(2191, 3, 20),
(2199, 3, 20);

-- Garrisons page (`name` must be UNIQUE)
INSERT INTO `garrisons` (id, `name`, `capacity`) VALUES
(1, "Tatooine", 10000),
(2, "Coruscant", 100000),
(3, "Kashyyk", 5000);

-- Loadouts page
INSERT INTO `loadouts` (`id`, `blaster`, `detonator`) VALUES
(12, "EL-16", "Thermal"),
(53, "E-11", "Sonic"),
(29, "DC-15A", "Sonic"),
(82, "EL-16", "Thermal"),
(28, "C-303", "Sonic"),
(20, "DLT-19", "Sonic"),
(99, "DC-15A", "Thermal");

-- Ships page
INSERT INTO `ships` (`id`, `type`) VALUES
(1, "Star Destroyer"),
(2, "AT-AT"),
(3, "TIE Fighter");

-- Droids page
INSERT INTO `droids` (`id`, `type`) VALUES
(4211, "Protocol"),
(2152, "Astromech"),
(1252, "Battle"),
(1244, "Battle"),
(5325, "Battle"),
(5262, "Battle"),
(2722, "Assassin"),
(1128, "General Labor"),
(3539, "General Labor"),
(1223, "Engineering");

-- Manifests page: occupant is droid
INSERT INTO `ships_droids` (`ship`, `droid`) VALUES
(1, 4211),
(2, 1252),
(3, 2722);

-- Manifests page: occupant is trooper
INSERT INTO `ships_troopers` (`ship`, `trooper`) VALUES
(2, 2187),
(3, 2199),
(1, 2191);
