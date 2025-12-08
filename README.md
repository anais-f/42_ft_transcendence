# ft_transcendence

## Database

Using SQLite with Better-sqlite3 for efficient, file-based data storage.
SQLite is a file, so it has to lock it when writing to prevent data corruption.
Better-sqlite3 is synchronous, so each operation blocks the event loop until it completes.
There are some risks of using SQLite in a concurrent environment, especially with multiple instances of the service. It's not only for performance but also for data integrity and preventing database locks and crash.
The pragmas set here help manage how SQLite handles concurrency and performance:

- **WAL** : Write-Ahead Logging, writen to improve concurrency and performance in SQLite databases. Reading doesn't block writing and vice versa, allowing multiple operations to occur simultaneously.
- **NORMAL** : Balances performance and data integrity. It reduces the number of sync operations to disk, improving speed while still providing a reasonable level of data safety.
- **CACHE_SIZE** = -64000 : Sets the cache size to 64MB. A negative value indicates the size is in kilobytes. A larger cache can improve performance by reducing disk I/O operations.
- **BUSY_TIMEOUT** = 5000 : Sets the busy timeout to 5000 milliseconds (5 seconds). This means that if the database is locked (e.g., by another connection), SQLite will wait up to 5 seconds for the lock to be released before returning a "database is busy" error.
