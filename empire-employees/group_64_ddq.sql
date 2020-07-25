CREATE TABLE troopers (
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `garrisons`;
CREATE TABLE garrisons (
  id INT AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  capacity INT(11) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `garrisons` (`name`, `capacity`) VALUES
("Tatooine", 10000),
("Coruscant", 100000),
("Kashyyk", 5000);


DROP TABLE IF EXISTS `loadouts`;
CREATE TABLE loadouts (
  id INT AUTO_INCREMENT,
  blaster VARCHAR(255) NOT NULL,
  detonator VARCHAR(11) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `loadouts` (`blaster`, `detonator`) VALUES
("EL-16", "Thermal"),
("E-11", "Fragmentation"),;


CREATE TABLE ships (
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE droids (
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE ships_troopers (
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE ships_droids (
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
