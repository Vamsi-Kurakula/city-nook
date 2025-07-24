# City Crawler Database Schema 
The schema is split into multiple files for clarity and maintainability.

## How to Set Up the Database

Run the following files in order:

1. `01_core_tables.sql`  — Core user, crawl, and progress tables
2. `02_social_tables.sql`  — Social features (friendships, requests, blocks, notifications, reports)
3. `03_functions_and_triggers.sql`  — Functions and triggers for automation
4. `04_indexes_and_comments.sql`  — Indexes and documentation comments
5. `05_rls_policies.sql`  — RLS enablement and security policies

To **reset the database**, use `deleteDatabase.sql`, then re-run these files in order.

See each file for details and documentation. 