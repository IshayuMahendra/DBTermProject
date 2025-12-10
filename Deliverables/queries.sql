-- Create new poll insert it to database
-- Used on page: /home  (via POST /api/polls)
INSERT INTO Poll (title, creator_id, image_id, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW());

-- Insert poll options for new poll
-- Used on page: /home  (via POST /api/polls)
INSERT INTO PollOption (poll_id, text, votes) VALUES (?, ?, 0);

-- Get a poll by its id
-- Used on pages: /home, /unvoted, /profile  (via GET /api/polls/{pollId})
SELECT poll_id, title, created_at, updated_at, creator_id, image_id FROM Poll WHERE poll_id = ?;

-- Shows voting results as percentages for each option on poll
-- Used on pages: /home, /unvoted, /profile  (via GET /api/polls/{pollId})
 SELECT o.option_id, o.poll_id, o.text, COUNT(v.vote_id) AS votes_for_option FROM PollOption o LEFT JOIN Vote v ON v.option_id = o.option_id WHERE o.poll_id = ? GROUP BY o.option_id, o.poll_id, o.text ORDER BY o.option_id;

-- Gets all polls for the home page and total votes per poll
-- Used on page: /home  (via GET /api/polls)
SELECT p.poll_id, p.title, p.created_at, p.updated_at, p.creator_id, p.image_id, COUNT(v.vote_id) AS total_votes FROM Poll p LEFT JOIN Vote v ON v.poll_id = p.poll_id GROUP BY p.poll_id, p.title, p.created_at, p.updated_at, p.creator_id, p.image_id ORDER BY p.created_at DESC;

-- gets polls user has not voted on
-- Used on page: /unvoted  (or Saved/Unvoted page, via GET /api/polls/unvoted/{userId})
SELECT DISTINCT p.poll_id, p.title, p.created_at, p.updated_at, p.creator_id, p.image_id FROM Poll p LEFT JOIN Vote v ON p.poll_id = v.poll_id AND v.user_id = ? WHERE v.vote_id IS NULL ORDER BY p.created_at DESC;

-- Get all polls created by specific user
-- Used on page: /profile  (via something like GET /api/profile/user or GET /api/polls/creator/{userId})
SELECT p.* FROM Poll p WHERE p.creator_id = ? ORDER BY p.created_at DESC;

-- Check if user voted on specific poll
-- Used on pages: /home, /unvoted, /profile  (via POST /api/polls/{pollId}/vote)
SELECT 1 FROM Vote WHERE poll_id = ? AND user_id = ? LIMIT 1;

-- Check if username is alreadt used at registration
-- Used on page: /register  (via POST /api/auth/register)
SELECT COUNT(*) FROM `User` WHERE username = ?;

-- Insert new user into database at registration
-- Used on page: /register  (via POST /api/auth/register)
INSERT INTO `User` (username, password, display_name) VALUES (?, ?, ?);

-- Find hashed password in datbase for validation at login
-- Used on page: /login  (via POST /api/auth/login)
SELECT password FROM `User` WHERE username = ?;

-- Update users stored password when changing it in settings
-- Used on page: /settings  (if updating by username, via PUT/POST /api/auth/update-password)
UPDATE `User` SET password = ? WHERE username = ?;

-- Get user info by username used after loging in 
-- Used on page: /login  (via POST /api/auth/login)
SELECT user_id, username, password, display_name FROM `User` WHERE username = ?;

-- Check current password and update it
-- Used on page: /settings  (via PUT /api/auth/update-password)
SELECT password FROM `User` WHERE user_id = ?;
UPDATE `User` SET password = ? WHERE user_id = ?;

-- Count how many time user voted on a specific poll
-- Used on pages: /home, /unvoted, /profile  (via POST /api/polls/{pollId}/vote)
SELECT COUNT(*) FROM Vote WHERE poll_id = ? AND user_id = ?;

-- Record user vote on specific poll increment vote count for chosen option
-- Used on pages: /home, /unvoted, /profile  (via POST /api/polls/{pollId}/vote)
INSERT INTO Vote (poll_id, option_id, user_id, voted_at) VALUES (?, ?, ?, NOW());
UPDATE PollOption SET votes = votes + 1 WHERE option_id = ?;

