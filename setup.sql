 DROP TABLE IF EXISTS signatures;
 DROP TABLE IF EXISTS users;

CREATE TABLE users(
      id SERIAL PRIMARY KEY,
      first VARCHAR(255) NOT NULL CHECK (first != ''),
      last VARCHAR(255) NOT NULL CHECK (last != ''),
      email VARCHAR(255) NOT NULL UNIQUE CHECK (email != ''),
      password VARCHAR(255) NOT NULL CHECK (password != ''),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );


  CREATE TABLE signatures(
      id SERIAL PRIMARY KEY,
      -- get rid of first and last!
      signature TEXT NOT NULL CHECK (signature != ''),
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );