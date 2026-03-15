# Admin User Creation Script

This directory contains scripts for administrative tasks.

## Creating an Admin User

To create an admin user for the DeReFund platform, use the `createAdmin.js` script.

### Method 1: Interactive Mode (Recommended)

Run the script without arguments and it will prompt you for the required information:

```bash
npm run create-admin
```

Or directly:

```bash
node scripts/createAdmin.js
```

The script will ask you for:
- Admin name
- Admin email
- Admin password

### Method 2: Command Line Arguments

Provide the information as command line arguments:

```bash
node scripts/createAdmin.js "Admin Name" admin@example.com "SecurePassword123"
```

### Method 3: Environment Variables

Set environment variables before running:

```bash
ADMIN_NAME="Admin Name" ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="SecurePassword123" npm run create-admin
```

### Password Requirements

The admin password must meet these requirements:
- At least 8 characters long
- Contains at least one uppercase letter
- Contains at least one lowercase letter
- Contains at least one number

### Example

```bash
# Interactive mode
npm run create-admin

# Command line arguments
node scripts/createAdmin.js "John Admin" john.admin@derefund.com "AdminPass123"

# Environment variables
ADMIN_NAME="John Admin" ADMIN_EMAIL="john.admin@derefund.com" ADMIN_PASSWORD="AdminPass123" npm run create-admin
```

### Output

Upon successful creation, you'll see:

```
✅ Admin user created successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User ID:    abc123-def456-...
Name:       John Admin
Email:      john.admin@derefund.com
Role:       ADMIN
Active:     true
Created:    2024-01-15 10:30:00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 You can now log in with this admin account at:
   http://localhost:5173 (or your frontend URL)

⚠️  Keep these credentials secure!
```

### Notes

- The script checks if an admin with the same email already exists
- If a user with that email exists but has a different role, the script will fail (you cannot convert existing users to admin)
- Admin users are created with `is_active = true` by default
- Make sure your `.env` file has the correct database credentials before running the script

### Troubleshooting

**Error: "User with email already exists"**
- If the user exists as ADMIN, the script will show the existing admin details
- If the user exists with a different role (DONOR/NGO), you cannot convert them to admin. Create a new account with a different email.

**Error: "Database connection failed"**
- Check your `.env` file has correct database credentials
- Ensure your database is running and accessible
- Verify network connectivity to your database

**Error: "Invalid email format"**
- Make sure the email follows standard format: `user@example.com`

**Error: "Password does not meet requirements"**
- Password must be at least 8 characters
- Must contain uppercase, lowercase, and number

