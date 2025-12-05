-- if rerunning file, drops tables
DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS Vote;
DROP TABLE IF EXISTS Poll;
DROP TABLE IF EXISTS PollOption;
DROP TABLE IF EXISTS Image;

-- -------------------------------------
-- User table
-- -------------------------------------
CREATE TABLE User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(20) NOT NULL,
    display_name VARCHAR(20) NOT NULL
);

-- -------------------------------------
-- Image table
-- -------------------------------------
CREATE TABLE Image (
    image_id VARCHAR(100) PRIMARY KEY,
    image_name VARCHAR(300) NOT NULL,
    image_url VARCHAR(500) NOT NULL
);

-- -------------------------------------
-- Poll table
-- -------------------------------------
CREATE TABLE Poll (
    poll_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    creator_id INT NOT NULL,
    image_id VARCHAR(100) NULL,

    CONSTRAINT fk_poll_user
        FOREIGN KEY (creator_id)
        REFERENCES User(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_poll_image
        FOREIGN KEY (image_id)
        REFERENCES Image(image_id)
        ON DELETE CASCADE
);

-- -------------------------------------
-- PollOption table
-- -------------------------------------
CREATE TABLE PollOption (
    option_id INT AUTO_INCREMENT PRIMARY KEY,
    poll_id INT NOT NULL,
    text VARCHAR(300) NOT NULL,
    votes INT NOT NULL DEFAULT 0,

    CONSTRAINT fk_option_poll
        FOREIGN KEY (poll_id)
        REFERENCES Poll(poll_id)
        ON DELETE CASCADE,
    
    -- no duplicate option in same poll
    CONSTRAINT uq_option_no_text_duplicate
        UNIQUE (poll_id, text)
);

-- -------------------------------------
-- Vote table
-- -------------------------------------
CREATE TABLE Vote (
    vote_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    poll_id INT NOT NULL,
    option_id INT NOT NULL,
    voted_at DATETIME NOT NULL, 

    CONSTRAINT fk_vote_user
        FOREIGN KEY (user_id)
        REFERENCES User(user_id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_vote_poll
        FOREIGN KEY (poll_id)
        REFERENCES Poll(poll_id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_vote_option
        FOREIGN KEY (option_id)
        REFERENCES PollOption(option_id)
        ON DELETE CASCADE,
    
    -- one vote per poll per user
    CONSTRAINT uq_user_one_vote
        UNIQUE (poll_id, user_id)
);



