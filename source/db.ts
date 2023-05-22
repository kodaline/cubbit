import sqlite3 from 'sqlite3'
sqlite3.verbose()

export default class DBManager {
  db: any
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
      folder VARCHAR(200) NOT NULL,
      key VARCHAR(200) NOT NULL,
      etag VARCHAR(200) NOT NULL,
      size INTEGER NOT NULL,
      sys_create DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
      sys_update DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY(bucket_id) REFERENCES bucket(id)
      UNIQUE(bucket_id, path)
    );`
    this.db.run(bucket)
    this.db.run(object)
  }
  async execute(query: string) {
    await this.db.exec(query)
  }
  async get(query: string) {
    return await new Promise((resolve, reject) => {
      this.db.serialize(()=>{
          this.db.get(query, (err: any, rows: any) => {
              if (err)
                  reject(err)
              resolve(rows)
          })
      });
    })
  }
  async all(query: string) {
    return await new Promise((resolve, reject) => {
      this.db.serialize(()=>{
          this.db.all(query, (err: any, rows: any) => {
              if (err)
                  reject(err)
              resolve(rows)
          })
      });
    })
  }
}




