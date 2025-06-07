-- CREATE DATABASE instagram;

CREATE Table account (
    id BIGSERIAL,
    username VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(254) NOT NULL UNIQUE,
    password VARCHAR(60) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP DEFAULT NULL,
    PRIMARY KEY(id)
);

CREATE UNIQUE INDEX idx_account ON account(id, username, email);

CREATE Table profile (
    id BIGSERIAL,
    account_id BIGINT,
    name VARCHAR(50),
    bio VARCHAR(300),
    avatar_url VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY(account_id) REFERENCES account(id) ON DELETE CASCADE
);

CREATE TABLE entity (
    id BIGSERIAL,
    PRIMARY KEY(id)
);

CREATE TABLE liked_entity (
    id BIGSERIAL,
    account_id BIGINT NOT NULL,
    entity_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    FOREIGN KEY(account_id) REFERENCES account(id) ON DELETE CASCADE,
    FOREIGN KEY(entity_id) REFERENCES entity(id) ON DELETE CASCADE,
    UNIQUE(account_id, entity_id)
);

CREATE TABLE bookmarked_entity (
    id BIGSERIAL,
    account_id BIGINT NOT NULL,
    entity_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    FOREIGN KEY(account_id) REFERENCES account(id) ON DELETE CASCADE,
    FOREIGN KEY(entity_id) REFERENCES entity(id) ON DELETE CASCADE,
    UNIQUE(account_id, entity_id)
);

CREATE TABLE post (
    id BIGSERIAL,
    account_id BIGINT NOT NULL,
    entity_id BIGINT NOT NULL UNIQUE,
    caption VARCHAR(300),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    FOREIGN KEY(account_id) REFERENCES account(id) ON DELETE CASCADE,
    FOREIGN KEY(entity_id) REFERENCES entity(id) ON DELETE CASCADE
);

CREATE TABLE post_media (
    id BIGSERIAL,
    post_id BIGINT NOT NULL,
    media_url VARCHAR(255) NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY(post_id) REFERENCES post(id) ON DELETE CASCADE
);

CREATE TABLE comment (
    id BIGSERIAL,
    account_id BIGINT NOT NULL,
    entity_id BIGINT NOT NULL UNIQUE,
    post_id BIGINT NOT NULL,
    parent_id BIGINT,
    body VARCHAR(300),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    FOREIGN KEY(account_id) REFERENCES account(id) ON DELETE CASCADE,
    FOREIGN KEY(post_id) REFERENCES post(id) ON DELETE CASCADE,
    FOREIGN KEY(parent_id) REFERENCES comment(id) ON DELETE CASCADE,
    FOREIGN KEY(entity_id) REFERENCES entity(id) ON DELETE CASCADE
);

CREATE TABLE follow (
    id BIGSERIAL,
    account_id BIGINT NOT NULL,
    followed_id BIGINT NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY(account_id) REFERENCES account(id) ON DELETE CASCADE,
    FOREIGN KEY(followed_id) REFERENCES account(id) ON DELETE CASCADE,
    UNIQUE(account_id, followed_id)
);

CREATE TABLE message (
    id BIGSERIAL,
    account_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    body VARCHAR(300) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP,
    PRIMARY KEY(id)
);

CREATE TABLE session (
    id VARCHAR(64) NOT NULL UNIQUE,
    account_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY(account_id) REFERENCES account(id) ON DELETE CASCADE
);