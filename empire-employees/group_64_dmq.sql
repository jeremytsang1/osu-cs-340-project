-------------------------------------------------------------------------------
-- troopers page

-- Display the trooper data in a table.
SELECT troopers.id AS `Trooper ID`,
       garrisons.id AS `Garrison ID`,
       garrisons.name AS `Garrison Name`,
       loadouts.id AS `Loadout ID`,
       loadouts.blaster AS `Blaster`,
       loadouts.detonator AS `Detonator`
  FROM troopers
	 INNER JOIN loadouts ON troopers.loadout=loadouts.id
	 INNER JOIN garrisons ON troopers.garrison=garrisons.id;

INSERT INTO `troopers` (`id`, `garrison`, `loadout`) VALUES
 (:idInput, :garrisonInput, :loadoutInput);

SELECT * 
    FROM troopers
    WHERE garrison = (garrisonForm);

-- Filter by trooper id
SELECT *
  FROM troopers;
WHERE id=:idInput;

-- Populate dropdown with possible garrisons to switch to move the trooper to.
SELECT id, name
  FROM garrisons; -- use backticks on `name` (SQL keyword)

-- Change garrison Assignment: moving to another garrison radio button
UPDATE troopers
   SET garrison=:garrisonInput
 WHERE id=:idInput;

-- Change garrison Assignment: removing from current garrison radio button
UPDATE troopers
   SET garrison=NULL
 WHERE id=:idInput;

-- Deleting troopers (RIP)
DELETE FROM `troopers` WHERE id=:idInput;

-------------------------------------------------------------------------------
-- garrisons page

SELECT * 
    FROM garrisons;

INSERT INTO `garrisons` (`id`, `name`, `capacity`) VALUES
(:idInput, :nameInput, :capacityInput);

-------------------------------------------------------------------------------
-- loadouts page
SELECT * FROM loadouts;
    INSERT INTO `loadouts` (`blaster`, `detonator`) VALUES
    (:blasterInput, :detonatorInput);

UPDATE loadouts 
    SET blaster = :blasterInput, detonator = :detonatorInput
    WHERE id = (:loadoutForm);


-------------------------------------------------------------------------------
-- ships page

SELECT *
  FROM ships;

INSERT INTO `ships` (`id`, `type`) VALUES
(:idInput, :typeInput);

-------------------------------------------------------------------------------
-- droids page
SELECT * 
    FROM droids;

INSERT INTO `droids` (`type`) VALUES
    (:typeInput);


-------------------------------------------------------------------------------
-- manifests page

--------------------------------------------------
-- ships_troopers
SELECT * FROM ships_troopers;

-- Adding a trooper to a ship
INSERT INTO `ships_troopers` (`ship`, `trooper`) VALUES
(:shipInput, :trooperInput);

-- Removing a trooper from a ship
DELETE FROM `ships_troopers` WHERE ship=:shipInput AND trooper=:trooperInput;

--------------------------------------------------
-- ships_droids
SELECT *
    FROM ships;

INSERT INTO `ships_droids` (`ship`, `droid`) VALUES
    (:shipInput, :droidInput);

DELETE FROM `ships_droids` WHERE ship = :shipInput OR :droidInput;
