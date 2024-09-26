#!/bin/bash

DB_NAME="sac_local_db"
DB_USER="postgres"
DB_PASSWORD="1234"
DB_HOST="localhost"
DB_PORT="5432"

check_db_exists() {
  PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -p $DB_PORT -lqt | cut -d \| -f 1 | grep -qw $DB_NAME
}

create_db() {
  echo "Database '$DB_NAME' does not exist. Creating..."
  PGPASSWORD=$DB_PASSWORD createdb -U $DB_USER -h $DB_HOST -p $DB_PORT $DB_NAME
  if [ $? -eq 0 ]; then
    echo "Database '$DB_NAME' created successfully."
  else
    echo "Error creating database '$DB_NAME'."
    exit 1
  fi
}

if check_db_exists; then
  echo "Database '$DB_NAME' already exists."
else
  create_db
fi
