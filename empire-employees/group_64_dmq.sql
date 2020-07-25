-------------------------------------------------------------------------------
-- troopers

SELECT *
  FROM troopers;

INSERT INTO `troopers` (`id`, `garrison`, `loadout`) VALUES
 (:idInput, :garrisonInput, :loadoutInput);



-------------------------------------------------------------------------------
-- garrisons page

SELECT * FROM garrisons;

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
SELECT * FROM droids;
INSERT INTO `droids` (`type`) VALUES
    (:typeInput);


-------------------------------------------------------------------------------
-- manifests page
