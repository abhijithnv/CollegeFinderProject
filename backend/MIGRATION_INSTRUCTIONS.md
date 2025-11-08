# Database Migration Instructions

## Issue Fixed
The `course_about` field in the `courses_1` table was limited to 500 characters (VARCHAR(500)), causing errors when users tried to add longer course descriptions.

## Solution
The model has been updated to use `TEXT` type instead of `VARCHAR(500)`, which supports much longer descriptions.

## Automatic Migration
The application will automatically migrate the database column on startup. When you deploy the updated code, the migration will run automatically.

## Manual Migration (If Needed)
If you need to run the migration manually before deploying, you can execute this SQL command directly on your Render database:

```sql
ALTER TABLE courses_1 
ALTER COLUMN course_about TYPE TEXT;
```

### How to Run on Render:
1. Go to your Render dashboard
2. Navigate to your PostgreSQL database
3. Open the "Connect" or "Shell" option
4. Run the SQL command above

## Verification
After migration, you can verify the change by running:

```sql
SELECT data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'courses_1' 
AND column_name = 'course_about';
```

The result should show `data_type = 'text'` and `character_maximum_length = NULL`.

