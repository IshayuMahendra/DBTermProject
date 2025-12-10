-- Run: mysql -u root -pmysqlpass db_term_project < data.sql

-- Clear data so file can be re-run safely
DELETE FROM Vote;
DELETE FROM PollOption;
DELETE FROM Poll;
DELETE FROM User;

-- Insert team users
INSERT INTO User (username, password, display_name) VALUES
('testuser', 'testpass123', 'Test User'),
('kayla', 'pass123', 'Kayla'),
('carnagist', 'pass123', 'Carnagist'),
('ishan', 'pass123', 'Ishan'),
('akhan', 'pass123', 'Asad');

-- Insert meaningful UGA-related polls
INSERT INTO Poll (title, created_at, updated_at, creator_id) VALUES
('Favorite CS Professor?', NOW(), NOW(), 1),
('Best Study Spot on Campus?', NOW(), NOW(), 2),
('Best Dining Hall at UGA?', NOW(), NOW(), 3),
('Which bus route is worst?', NOW(), NOW(), 4),
('Hardest CS course?', NOW(), NOW(), 5);

-- Get base poll IDs for reference
SET @professor_poll = (SELECT poll_id FROM Poll WHERE title='Favorite CS Professor?' LIMIT 1);
SET @study_poll     = (SELECT poll_id FROM Poll WHERE title='Best Study Spot on Campus?' LIMIT 1);
SET @dining_poll    = (SELECT poll_id FROM Poll WHERE title='Best Dining Hall at UGA?' LIMIT 1);
SET @bus_poll       = (SELECT poll_id FROM Poll WHERE title='Which bus route is worst?' LIMIT 1);
SET @hardest_poll   = (SELECT poll_id FROM Poll WHERE title='Hardest CS course?' LIMIT 1);


-- Poll Options

-- Favorite CS Professor?
INSERT INTO PollOption (poll_id, text) VALUES
(@professor_poll, 'Hollingsworth'),
(@professor_poll, 'Lamarca'),
(@professor_poll, 'Sami Menik');

-- Best study spot
INSERT INTO PollOption (poll_id, text) VALUES
(@study_poll, 'Main Library'),
(@study_poll, 'MLC'),
(@study_poll, 'Tate'),
(@study_poll, 'Oglethorpe');

-- Best dining hall
INSERT INTO PollOption (poll_id, text) VALUES
(@dining_poll, 'Bolton'),
(@dining_poll, 'Oglethorpe'),
(@dining_poll, 'Village Summit'),
(@dining_poll, 'Orbit');

-- Worst bus route
INSERT INTO PollOption (poll_id, text) VALUES
(@bus_poll, 'East-West'),
(@bus_poll, 'Night Campus'),
(@bus_poll, 'Riverbend'),
(@bus_poll, 'Orbit');

-- Hardest CS course
INSERT INTO PollOption (poll_id, text) VALUES
(@hardest_poll, 'CSCI 1302'),
(@hardest_poll, 'CSCI 1730'),
(@hardest_poll, 'CSCI 2150'),
(@hardest_poll, 'CSCI 2720'),
(@hardest_poll, 'CSCI 4210');


-- Insert 1000+ Sample Polls
DELIMITER $$

CREATE PROCEDURE generate_sample_polls()
BEGIN
    DECLARE i INT DEFAULT 1;

    WHILE i <= 1000 DO
        INSERT INTO Poll (title, created_at, updated_at, creator_id)
        VALUES (CONCAT('Sample Poll ', i), NOW(), NOW(), 1);
        SET i = i + 1;
    END WHILE;
END $$

DELIMITER ;

CALL generate_sample_polls();

DROP PROCEDURE generate_sample_polls;

-- Show confirmation
SELECT COUNT(*) AS total_polls FROM Poll;