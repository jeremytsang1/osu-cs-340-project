-------------------------------------------------------------------------------
-- troopers


-------------------------------------------------------------------------------
-- garrisons page


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


-------------------------------------------------------------------------------
-- droids page
SELECT * FROM droids;
INSERT INTO `droids` (`type`) VALUES
    (:typeInput);


-------------------------------------------------------------------------------
-- manifests page
