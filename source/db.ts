import sqlite3 from 'sqlite3'
sqlite3.verbose()

export default class DBManager {
  db: sqlite3.Database
  constructor() {
    // Open a SQLite database, stored in the file db.sqlite
    const db = new sqlite3.Database('/tmp/db.sqlite')
    this.db = db
    db.on('trace', (data) => {
      console.log(data)
    })
  }
  async init() {
    const bucket = `CREATE TABLE IF NOT EXISTS bucket (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location VARCHAR(200) NOT NULL UNIQUE,
      description TEXT NULL,
      sys_create DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
      sys_update DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
    );`
    
    const object = `CREATE TABLE IF NOT EXISTS object (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bucket_id INTEGER NOT NULL,
      path VARCHAR(200) NOT NULL,
      sys_create DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
      sys_update DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY(bucket_id) REFERENCES bucket(id)
    );`
    this.db.run(bucket)
    return this.db.run(object)
  }
  async insert(query: string) {
    return this.db.exec(query)
  }

  async select(query: string) {

  }
}




