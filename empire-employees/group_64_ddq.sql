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

-- Garrisons page (`name` must be UNIQUE)
INSERT INTO `garrisons` (id, `name`, `capacity`) VALUES
(39, "Tatooine", 10000),
(10, "Coruscant", 100000),
(59, "Kashyyyk", 5000),
(4972, "Yityl", 2000),
(120, "Wobani", 3000),
(129, "Vaal", 4000),
(293, "Notak", 5000),
(2921, "Kintoni", 9000),
(192, "Corlass", 10000),
(101, "Mustafar", 5000),
(241, "Alderaan", 28000),
(659, "Naboo", 15000);

-- Loadouts page
INSERT INTO `loadouts` (`id`, `blaster`, `detonator`) VALUES
(12, "EL-16", "Thermal"),
(53, "E-11", "Sonic"),
(29, "DC-15A", "Sonic"),
(82, "EL-16", "Thermal"),
(28, "C-303", "Sonic"),
(20, "DLT-19", "Sonic"),
(99, "DC-15A", "Thermal");

-- Troopers page: which trooper has which garrison and loadout. Needs to come
-- AFTER garrisons and loadouts have been inserted due to FK constraints.
INSERT INTO `troopers` (`id`, `garrison`, `loadout`) VALUES
(2187, NULL, 12),
(2188, 39, 53),
(2189, 120, 82),
(2190, 10, 28),
(2191, NULL, 20),
(2192, NULL, 99),
(2199, 10, 20);

-- Ships page
INSERT INTO `ships` (`id`, `type`) VALUES
(2947, "Star Destroyer"),
(2946, "AT-AT"),
(5076, "AT-ST"),
(2047, "TIE Fighter"),
(2461, "Freighter"),
(2222, "TIE Bomber"),
(3967, "TIE Fighter"),
(1925, "TIE Bomber"),
(9483, "TIE Fighter"),
(8847, "Freighter"),
(8290, "Speeder Bike"),
(2978, "TIE Fighter"),
(5272, "Speeder Bike"),
(5892, "Speeder Bike");

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
(2947, 4211),
(2947, 1252),
(2047, 1252),
(8847, 2722);

-- Manifests page: occupant is trooper
INSERT INTO `ships_troopers` (`ship`, `trooper`) VALUES
(2947, 2187),
(9483, 2187),
(2947, 2199),
(5076, 2191),
(8290, 2192);
