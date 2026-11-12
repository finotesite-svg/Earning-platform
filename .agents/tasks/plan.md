# MongoDB to PostgreSQL Migration Plan

## Overview
This plan migrates the Earning Platform backend from MongoDB/Mongoose to PostgreSQL/Sequelize. The backend uses CommonJS (require/module.exports), no TypeScript. All 11 models (not 12 - Wallet.js is empty) will be converted, along with 6 route files that contain complex queries including aggregations, population (joins), atomic updates, and conditional queries.

---

## Implementation Plan

- [ ] 1. Install PostgreSQL dependencies and remove MongoDB dependencies
      Run `npm uninstall mongoose` to remove MongoDB driver, then `npm install sequelize pg pg-hstore` to add Sequelize ORM and PostgreSQL drivers.
      Files: c:\projects\Earning-platform\backend\package.json
      Verify: Run `node -e "require('sequelize'); console.log('Sequelize loaded')"` and confirm it prints "Sequelize loaded" without errors.

- [ ] 2. Create Sequelize database configuration file
      Create c:\projects\Earning-platform\backend\config\database.js that exports a configured Sequelize instance. Use `process.env.DATABASE_URL` from .env file. Configure connection pool: max 10, min 0, acquire 30000ms, idle 10000ms. Set logging to console.log in development. Use `dialectOptions: { ssl: false }` for local development.
      Files: c:\projects\Earning-platform\backend\config\database.js (new file)
      Verify: Run `node -e "const seq = require('./backend/config/database'); seq.authenticate().then(() => console.log('Connected')).catch(e => console.error(e))"` from project root and confirm connection succeeds.

- [ ] 3. Convert User model to Sequelize
      Convert c:\projects\Earning-platform\backend\models\User.js from Mongoose to Sequelize. Use INTEGER primary key with autoIncrement. Map types: String → STRING, Number → FLOAT for balance and dailyStreak, Boolean → BOOLEAN, Date → DATE. Add unique constraint on phone and referralCode. The referredBy field becomes referredById INTEGER with allowNull: true. Add indexes on phone, referralCode, and referredById. Keep timestamps: true.
      Files: c:\projects\Earning-platform\backend\models\User.js
      Verify: Run `node --check c:/projects/Earning-platform/backend/models/User.js` and confirm no syntax errors.

- [ ] 4. Convert Task model to Sequelize
      Convert c:\projects\Earning-platform\backend\models\Task.js to Sequelize. Use INTEGER primary key. Map String → STRING, Number → FLOAT for reward, Date → DATE for deadline, Boolean → BOOLEAN for isActive. Map eligibilityRules (Mixed/Object) to JSON type. Set default values: isActive = true, link = '', eligibilityRules = {}.
      Files: c:\projects\Earning-platform\backend\models\Task.js
      Verify: Run `node --check c:/projects/Earning-platform/backend/models/Task.js` and confirm no syntax errors.

- [ ] 5. Convert TaskSubmission model to Sequelize
      Convert c:\projects\Earning-platform\backend\models\TaskSubmission.js to Sequelize. Use INTEGER primary key. Add userId INTEGER references User(id) and taskId INTEGER references Task(id) as foreign keys with onDelete: CASCADE. Map evidence to TEXT, status to ENUM(['Pending', 'Approved', 'Rejected']) with default 'Pending'. Add composite index on (userId, taskId) and index on status.
      Files: c:\projects\Earning-platform\backend\models\TaskSubmission.js
      Verify: Run `node --check c:/projects/Earning-platform/backend/models/TaskSubmission.js` and confirm no syntax errors.

- [ ] 6. Convert Referral model to Sequelize
      Convert c:\projects\Earning-platform\backend\models\Referral.js to Sequelize. Use INTEGER primary key. Add referrerId INTEGER references User(id) and referredUserId INTEGER references User(id) as foreign keys. Add unique constraint on referredUserId (each user can only be referred once). Map reward to FLOAT with default 0. Add index on referrerId.
      Files: c:\projects\Earning-platform\backend\models\Referral.js
      Verify: Run `node --check c:/projects/Earning-platform/backend/models/Referral.js` and confirm no syntax errors.

- [ ] 7. Convert WithdrawalRequest model to Sequelize
      Convert c:\projects\Earning-platform\backend\models\WithdrawalRequest.js to Sequelize. Use INTEGER primary key. Add userId INTEGER references User(id) as foreign key. Map amount and feeAmount to FLOAT (default 0 for feeAmount), paymentMethod to ENUM(['telebirr', 'bank']), accountNumber to STRING, status to ENUM(['Pending', 'Completed', 'Rejected']) with default 'Pending'. Add index on userId and status.
      Files: c:\projects\Earning-platform\backend\models\WithdrawalRequest.js
      Verify: Run `node --check c:/projects/Earning-platform/backend/models/WithdrawalRequest.js` and confirm no syntax errors.

- [ ] 8. Convert Notification model to Sequelize
      Convert c:\projects\Earning-platform\backend\models\Notification.js to Sequelize. Use INTEGER primary key. Add userId INTEGER references User(id) as foreign key with onDelete: CASCADE. Map title and message to STRING/TEXT, isRead to BOOLEAN with default false. Add composite index on (userId, isRead) for efficient unread queries.
      Files: c:\projects\Earning-platform\backend\models\Notification.js
      Verify: Run `node --check c:/projects/Earning-platform/backend/models/Notification.js` and confirm no syntax errors.

- [ ] 9. Convert SupportTicket model to Sequelize
      Convert c:\projects\Earning-platform\backend\models\SupportTicket.js to Sequelize. Use INTEGER primary key. Add userId INTEGER references User(id) as foreign key. Map subject and message to STRING/TEXT with trim, status to ENUM(['Pending', 'In Progress', 'Resolved']) with default 'Pending', adminReply to TEXT with allowNull: true. Add index on userId and status.
      Files: c:\projects\Earning-platform\backend\models\SupportTicket.js
      Verify: Run `node --check c:/projects/Earning-platform/backend/models/SupportTicket.js` and confirm no syntax errors.

- [ ] 10. Convert SystemSetting model to Sequelize
       Convert c:\projects\Earning-platform\backend\models\SystemSetting.js to Sequelize. Use INTEGER primary key. Add unique constraint on key field (STRING). Map minWithdrawal, referralBonus, dailyBonus, platformFee to FLOAT with defaults 200, 50, 50, 5 respectively. Add index on key field.
       Files: c:\projects\Earning-platform\backend\models\SystemSetting.js
       Verify: Run `node --check c:/projects/Earning-platform/backend/models/SystemSetting.js` and confirm no syntax errors.

- [ ] 11. Convert AuditLog model to Sequelize
       Convert c:\projects\Earning-platform\backend\models\AuditLog.js to Sequelize. Use INTEGER primary key. Add adminId INTEGER references User(id) as foreign key. Map action to STRING (required), targetType to STRING (nullable), targetId to INTEGER (nullable), details to JSON (nullable). Add index on adminId and targetType.
       Files: c:\projects\Earning-platform\backend\models\AuditLog.js
       Verify: Run `node --check c:/projects/Earning-platform/backend/models/AuditLog.js` and confirm no syntax errors.

- [ ] 12. Convert LedgerEntry model to Sequelize
       Convert c:\projects\Earning-platform\backend\models\LedgerEntry.js to Sequelize. Use INTEGER primary key. Add userId INTEGER references User(id) as foreign key. Map type to ENUM(['task_reward', 'referral_bonus', 'daily_bonus', 'withdrawal', 'withdrawal_refund', 'fee']) required, amount to FLOAT required, reference to JSON (nullable). Add index on userId and composite index on (userId, type).
       Files: c:\projects\Earning-platform\backend\models\LedgerEntry.js
       Verify: Run `node --check c:/projects/Earning-platform/backend/models/LedgerEntry.js` and confirm no syntax errors.

- [ ] 13. Convert PaymentEvent model to Sequelize
       Convert c:\projects\Earning-platform\backend\models\PaymentEvent.js to Sequelize. Use INTEGER primary key. Add userId INTEGER references User(id) as foreign key, withdrawalRequestId INTEGER references WithdrawalRequest(id) with allowNull: true. Map event to ENUM(['initiated', 'completed', 'rejected', 'refunded']) required, amount to FLOAT required, metadata to JSON. Add indexes on userId and withdrawalRequestId.
       Files: c:\projects\Earning-platform\backend\models\PaymentEvent.js
       Verify: Run `node --check c:/projects/Earning-platform/backend/models/PaymentEvent.js` and confirm no syntax errors.

- [ ] 14. Create model associations and index file
       Create c:\projects\Earning-platform\backend\models\index.js that imports all models and defines associations: User.hasMany(Referral, {foreignKey: 'referrerId'}), User.hasMany(TaskSubmission), Task.hasMany(TaskSubmission), User.hasOne(Referral, {as: 'ReferralRecord', foreignKey: 'referredUserId'}), User.hasMany(WithdrawalRequest), User.hasMany(Notification), User.hasMany(SupportTicket), User.hasMany(AuditLog, {foreignKey: 'adminId'}), User.hasMany(LedgerEntry), User.hasMany(PaymentEvent), WithdrawalRequest.hasMany(PaymentEvent). Export sequelize instance and all models.
       Files: c:\projects\Earning-platform\backend\models\index.js (new file)
       Verify: Run `node --check c:/projects/Earning-platform/backend/models/index.js` and confirm no syntax errors.

- [ ] 15. Update server.js to use Sequelize connection
       Replace mongoose.connect() in c:\projects\Earning-platform\backend\server.js with sequelize.authenticate() and sequelize.sync({ alter: true }). Import sequelize from './models/index.js'. Remove mongoose require. Update connection success message to "Connected to PostgreSQL successfully! 🐘". Keep error handling and PORT logic unchanged.
       Files: c:\projects\Earning-platform\backend\server.js
       Verify: Run `node --check c:/projects/Earning-platform/backend/server.js` and confirm no syntax errors.

- [ ] 16. Update .env file for PostgreSQL connection
       Replace MONGO_URI in c:\projects\Earning-platform\backend\.env with DATABASE_URL=postgresql://postgres:password@localhost:5432/earning_platform. Keep JWT_SECRET, PORT, and FRONTEND_URL unchanged. Add comment instructing user to update postgres password and create database 'earning_platform' in pgAdmin4.
       Files: c:\projects\Earning-platform\backend\.env
       Verify: Manual inspection - confirm DATABASE_URL format is correct and MONGO_URI is removed.

- [ ] 17. Convert auth routes (auth.js) to Sequelize queries
       Update c:\projects\Earning-platform\backend\routes\auth.js to use Sequelize API. Replace User.findOne() with User.findOne({ where: {...} }), User.findByIdAndUpdate() with User.findByPk() + instance.increment(), new User().save() with User.create(), etc. Replace _id with id throughout. Replace $inc operator with instance.increment() or Sequelize.literal(). Update populate references to include: [{ model: User, attributes: [...] }]. Handle crypto and bcrypt logic unchanged.
       Files: c:\projects\Earning-platform\backend\routes\auth.js
       Verify: Run `node --check c:/projects/Earning-platform/backend/routes/auth.js` and confirm no syntax errors.

- [ ] 18. Convert task routes (task.js) to Sequelize queries
       Update c:\projects\Earning-platform\backend\routes\task.js to use Sequelize API. Replace Task.find({ isActive: true }) with Task.findAll({ where: { isActive: true } }), TaskSubmission.findOne() with appropriate where clause, new TaskSubmission().save() with TaskSubmission.create(). Replace status $in operator with { [Op.in]: [...] } from Sequelize.Op. Update _id references to id.
       Files: c:\projects\Earning-platform\backend\routes\task.js
       Verify: Run `node --check c:/projects/Earning-platform/backend/routes/task.js` and confirm no syntax errors.

- [ ] 19. Convert withdrawal routes (withdrawal.js) to Sequelize queries
       Update c:\projects\Earning-platform\backend\routes\withdrawal.js to use Sequelize API. Replace User.findOneAndUpdate() with transaction-based findOne + decrement/increment + save pattern to ensure atomicity. Use sequelize.transaction() for withdrawal request creation. Replace WithdrawalRequest.find() with findAll(), _id with id. Import Op from 'sequelize' for $gte operator replacement: { balance: { [Op.gte]: totalDeduction } }.
       Files: c:\projects\Earning-platform\backend\routes\withdrawal.js
       Verify: Run `node --check c:/projects/Earning-platform/backend/routes/withdrawal.js` and confirm no syntax errors.

- [ ] 20. Convert user routes (user.js) to Sequelize queries
       Update c:\projects\Earning-platform\backend\routes\user.js to use Sequelize API. Replace User.findById() with User.findByPk(), Referral.find({ referrerId: ... }) with Referral.findAll({ where: { referrerId: ... }, include: [{ model: User, as: 'ReferredUser', attributes: ['name', 'phone'] }] }). Replace User.findOneAndUpdate() with sequelize.transaction() wrapping findOne + update + save for atomic daily claim with date comparison in where clause. Use Op.or, Op.lte for date conditionals. Replace LedgerEntry.find() with findAll().
       Files: c:\projects\Earning-platform\backend\routes\user.js
       Verify: Run `node --check c:/projects/Earning-platform/backend/routes/user.js` and confirm no syntax errors.

- [ ] 21. Convert support routes (support.js) to Sequelize queries
       Update c:\projects\Earning-platform\backend\routes\support.js to use Sequelize API. Replace SupportTicket.find() with findAll({ where: ... }), Notification.find() with findAll(), findOneAndUpdate() with findOne + update pattern, updateMany() with Notification.update({ isRead: true }, { where: { userId: ..., isRead: false } }), findOneAndDelete() with destroy({ where: ... }), countDocuments() with count({ where: ... }).
       Files: c:\projects\Earning-platform\backend\routes\support.js
       Verify: Run `node --check c:/projects/Earning-platform/backend/routes/support.js` and confirm no syntax errors.

- [ ] 22. Convert admin routes (admin.js) - part 1: overview and user management
       Update c:\projects\Earning-platform\backend\routes\admin.js admin overview section. Replace countDocuments() with count({ where: ... }), Task.countDocuments({ isActive: true }) with Task.count({ where: { isActive: true } }). Replace WithdrawalRequest.aggregate() with sequelize.fn('SUM', sequelize.col('amount')) using findAll + attributes. Replace populate() with include: [{ model: User, attributes: ['name'] }, { model: Task, attributes: ['title'] }]. Update user management routes: replace findByIdAndUpdate with findByPk + instance.update().
       Files: c:\projects\Earning-platform\backend\routes\admin.js
       Verify: Run `node --check c:/projects/Earning-platform/backend/routes/admin.js` and confirm no syntax errors.

- [ ] 23. Convert admin routes (admin.js) - part 2: task, submission, withdrawal management
       Continue updating c:\projects\Earning-platform\backend\routes\admin.js. Replace Task.create() with Sequelize create (already compatible but verify attributes). Replace Task.findByIdAndUpdate() with findByPk + instance.update({ ...fields }). For submissions and withdrawals: replace findOneAndUpdate() with findOne({ where: { id: ..., status: 'Pending' } }) + instance.update(). Replace exists() with findByPk() !== null. Update atomic balance changes to use instance.increment() or transactions. Replace $set with direct field assignment.
       Files: c:\projects\Earning-platform\backend\routes\admin.js
       Verify: Run `node --check c:/projects/Earning-platform/backend/routes/admin.js` and confirm no syntax errors.

- [ ] 24. Convert admin routes (admin.js) - part 3: settings, support, audit logs
       Complete c:\projects\Earning-platform\backend\routes\admin.js migration. Replace SystemSetting.findOneAndUpdate() with findOrCreate + instance.update pattern: SystemSetting.findOrCreate({ where: { key: 'platform' }, defaults: { minWithdrawal: 200, ... } }), then update if needed. Replace SupportTicket populate with include. Replace AuditLog.find() with findAll({ include: [{ model: User, as: 'Admin', attributes: ['name', 'phone'] }], order: [['createdAt', 'DESC']], limit: 100 }).
       Files: c:\projects\Earning-platform\backend\routes\admin.js
       Verify: Run `node --check c:/projects/Earning-platform/backend/routes/admin.js` and confirm no syntax errors.

- [ ] 25. Create database and test server startup
       Use pgAdmin4 to create database 'earning_platform'. Update DATABASE_URL password in .env to match your PostgreSQL postgres user password. Start the server with `node backend/server.js` - Sequelize will auto-create tables via sync({ alter: true }). Confirm server starts, connects to PostgreSQL, and prints "Connected to PostgreSQL successfully! 🐘" and "Server is running on port 5000 🚀".
       Files: N/A (database creation + server startup)
       Verify: Server starts without errors and all tables are created in PostgreSQL (verify in pgAdmin4 that tables: users, tasks, tasksubmissions, referrals, withdrawalrequests, notifications, supporttickets, systemsettings, auditlogs, ledgerentries, paymentevents exist).

---

## Key Migration Patterns

### MongoDB → Sequelize Query Conversion Reference

| MongoDB/Mongoose | Sequelize |
|------------------|-----------|
| `Model.find()` | `Model.findAll()` |
| `Model.findOne()` | `Model.findOne({ where: {...} })` |
| `Model.findById(id)` | `Model.findByPk(id)` |
| `Model.findByIdAndUpdate(id, update)` | `Model.findByPk(id)` + `instance.update(update)` |
| `Model.findOneAndUpdate(filter, update)` | `Model.findOne({ where: filter })` + `instance.update()` |
| `new Model(data).save()` | `Model.create(data)` |
| `Model.countDocuments(filter)` | `Model.count({ where: filter })` |
| `Model.exists(filter)` | `Model.findOne({ where: filter }) !== null` |
| `instance.save()` | `instance.save()` (same) |
| `.populate('field')` | `include: [{ model: RelatedModel }]` |
| `.select('field1 field2')` | `attributes: ['field1', 'field2']` |
| `.sort({ field: -1 })` | `order: [['field', 'DESC']]` |
| `.limit(n)` | `limit: n` |
| `{ field: { $gte: value } }` | `{ field: { [Op.gte]: value } }` |
| `{ field: { $in: array } }` | `{ field: { [Op.in]: array } }` |
| `{ $or: [cond1, cond2] }` | `{ [Op.or]: [cond1, cond2] }` |
| `{ $inc: { balance: amount } }` | `instance.increment({ balance: amount })` |
| `.aggregate([...])` | Use `sequelize.fn()`, `attributes`, `group` |
| `mongoose.Schema.Types.ObjectId` | `INTEGER` with autoIncrement |
| `_id` | `id` |

### Data Type Mapping

| Mongoose | Sequelize (DataTypes) |
|----------|----------------------|
| String | STRING or TEXT |
| Number | FLOAT or INTEGER |
| Boolean | BOOLEAN |
| Date | DATE |
| mongoose.Schema.Types.Mixed | JSON |
| enum: [...] | ENUM([...]) |
| ObjectId references | INTEGER with foreignKey |

### Transaction Pattern for Atomic Operations

MongoDB's `findOneAndUpdate` with conditions is atomic. In PostgreSQL/Sequelize, wrap multi-step operations in transactions:

```javascript
const result = await sequelize.transaction(async (t) => {
  const user = await User.findOne({ 
    where: { id: userId, balance: { [Op.gte]: amount } },
    transaction: t,
    lock: t.LOCK.UPDATE
  });
  if (!user) throw new Error('Insufficient balance');
  await user.decrement({ balance: amount }, { transaction: t });
  return user;
});
```

---

## Post-Migration Verification Checklist

After completing all steps:

1. ✓ Server starts without errors
2. ✓ All 11 tables created in PostgreSQL
3. ✓ Test user registration (auth.js /register)
4. ✓ Test user login (auth.js /login)
5. ✓ Test task creation as admin (admin.js POST /tasks)
6. ✓ Test task submission as user (task.js POST /submit)
7. ✓ Test withdrawal request (withdrawal.js POST /request)
8. ✓ Test daily claim (user.js POST /daily-claim)
9. ✓ Test referral bonus on registration
10. ✓ Check foreign key constraints work (try deleting referenced record)

---

## Notes

- **Environment Setup**: User must create PostgreSQL database 'earning_platform' using pgAdmin4 before step 25.
- **Password**: Update DATABASE_URL in .env with actual PostgreSQL password.
- **Migration Strategy**: This is a code-level migration. No data migration is included - this assumes starting fresh with PostgreSQL. If data migration is needed, a separate ETL process would be required.
- **sync({ alter: true })**: Auto-modifies schema on startup during development. Use migrations (sequelize-cli) for production.
- **Transactions**: Critical operations (withdrawal, daily claim) must use transactions to ensure atomicity that MongoDB provided via single-document updates.
- **Testing**: Each route should be tested after conversion to ensure business logic remains intact.
