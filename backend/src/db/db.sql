-- CREATE DATABASE instagram;

-- \c instagram

CREATE Table account (
    id BIGSERIAL,
    username VARCHAR(30)NOT NULL UNIQUE,
    email VARCHAR(254) NOT NULL UNIQUE,
    password VARCHAR(60) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP DEFAULT NULL,
    deleted_at TIMESTAMP DEFAULT NULL,
    PRIMARY KEY(id)
);

CREATE UNIQUE INDEX idx_account ON account(id, username, email, deleted_at);