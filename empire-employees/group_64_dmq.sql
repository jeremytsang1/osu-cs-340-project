-------------------------------------------------------------------------------
-- TROOPERS PAGE

-- display the trooper data in a table
SELECT troopers.id AS `trooperID`,
       garrisons.id AS `garrisonID`,
       garrisons.name AS `garrisonName`,
       loadouts.id AS `loadoutID`,
       loadouts.blaster AS `blaster`,
       loadouts.detonator AS `detonator`
  FROM troopers
	 INNER JOIN loadouts ON troopers.loadout=loadouts.id
	 INNER JOIN garrisons ON troopers.garrison=garrisons.id;

-- add new trooper
INSERT INTO `troopers` (`id`, `garrison`, `loadout`) VALUES
 (:idInput, :garrisonInput, :loadoutInput);

-- filter by garrison id
SELECT troopers.id AS `trooperID`,
       garrisons.id AS `garrisonID`,
       garrisons.name AS `garrisonName`,
       loadouts.id AS `loadoutID`,
       loadouts.blaster AS `blaster`,
       loadouts.detonator AS `detonator`
  FROM troopers
	 INNER JOIN loadouts ON troopers.loadout=loadouts.id
	 INNER JOIN garrisons ON troopers.garrison=garrisons.id
WHERE garrisons.name = (garrisonForm);

-- filter by ship id
SELECT troopers.id AS `trooperID`,
       garrisons.id AS `garrisonID`,
       garrisons.name AS `garrisonName`,
       loadouts.id AS `loadoutID`,
       loadouts.blaster AS `blaster`,
       loadouts.detonator AS `detonator`
  FROM troopers
	 INNER JOIN loadouts ON troopers.loadout=loadouts.id
	 LEFT JOIN garrisons ON troopers.garrison=garrisons.id
 WHERE troopers.id IN (
   SELECT trooper_subq.id
     FROM troopers AS trooper_subq
	    INNER JOIN ships_troopers ON ships_troopers.trooper = trooper_subq.id
    WHERE ships_troopers.ship=:shipIDInput
 );

-- change garrison assignment: moving to another garrison radio button
UPDATE troopers
   SET garrison=:garrisonInput
 WHERE id=:idInput;

-- change garrison assignment: removing from current garrison radio button
UPDATE troopers
   SET garrison=NULL
 WHERE id=:idInput;

-- delete an existing trooper (RIP)
DELETE FROM `troopers` WHERE id=:idInput;

-------------------------------------------------------------------------------
-- GARRISONS PAGE

-- display the garrison data in a table
SELECT id, name, capacity
  FROM garrisons;

-- Add a new garrison
INSERT INTO `garrisons` (`id`, `name`, `capacity`) VALUES
(:idInput, :nameInput, :capacityInput);

-------------------------------------------------------------------------------
-- LOADOUTS PAGE

-- display the loadout data in a table
SELECT id, blaster, detonator
  FROM loadouts;

-- add a new loadout
INSERT INTO `loadouts` (`blaster`, `detonator`) VALUES
(:blasterInput, :detonatorInput);

-- edit an existing loadout
UPDATE loadouts 
    SET blaster = :blasterInput, detonator = :detonatorInput
    WHERE id = (:loadoutForm);

-------------------------------------------------------------------------------
-- SHIPS PAGE

-- display the ship data in a table
SELECT id, type
  FROM ships;

-- add a new ship
INSERT INTO `ships` (`id`, `type`) VALUES
(:idInput, :typeInput);

-------------------------------------------------------------------------------
-- DROIDS PAGE

-- display the droid data in a table.
SELECT id, type
    FROM droids;

-- add a new droid
INSERT INTO `droids` (id, `type`) VALUES
(:idInput, :typeInput);


-------------------------------------------------------------------------------
-- MANIFESTS PAGE

--------------------------------------------------
-- ships_troopers

-- display which troopers are on which ships
SELECT * FROM ships_troopers;

-- add a trooper to a ship
INSERT INTO `ships_troopers` (`ship`, `trooper`) VALUES
(:shipInput, :trooperInput);

-- remove a trooper from a ship
DELETE FROM `ships_troopers` WHERE ship=:shipInput AND trooper=:trooperInput;

--------------------------------------------------
-- ships_droids

-- display which droids are on which ships
SELECT *
    FROM ships;

-- add a droid to a ship
INSERT INTO `ships_droids` (`ship`, `droid`) VALUES
    (:shipInput, :droidInput);

-- remove a droid from a ship
DELETE FROM `ships_droids` WHERE ship = :shipInput OR :droidInput;
