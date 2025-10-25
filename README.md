# Modular Project - Dynamic Module Management System

A full-stack modular application that allows dynamic loading, management, and execution of zip-based modules with complete CRUD operations.

## 🚀 Features

### Core Functionality
- **Dynamic Module Loading**: Upload and load modules as ZIP files
- **Module Management**: Activate/deactivate modules without restarting server
- **Real-time UI Updates**: Frontend automatically reflects module status changes
- **Database Integration**: MySQL with Sequelize ORM
- **RESTful APIs**: Complete backend API for module and data management

### Module Types
- **Todo Module**: Complete todo CRUD operations (Create, Read, Update, Delete)
- **User Module**: User management with full CRUD operations
- **Extensible**: Easy to create new modules following the same pattern

### Module Management Features
- ✅ Upload modules as ZIP files
- ✅ Automatic extraction and installation
- ✅ Activate/Deactivate modules
- ✅ Visual status indicators (Active/Inactive)
- ✅ Dynamic API path generation
- ✅ Frontend component loading

## 🏗️ Architecture

### Backend (Node.js + Express)
```
backend/
├── src/
│   ├── server.js              # Main server with dynamic module loading
│   ├── routes/
│   │   ├── index.js          # API routes
│   │   └── moduleRoutes.js   # Module management routes
│   ├── controllers/
│   │   ├── moduleController.js # Module CRUD operations
│   │   └── [module]Controller.js # Individual module controllers
│   ├── services/
│   │   └── moduleService.js  # Module upload/extraction logic
│   ├── database/
│   │   ├── models/
│   │   │   ├── index.js
│   │   │   ├── module.js     # Module metadata model
│   │   │   └── [module].js   # Individual module models
│   │   ├── migrations/       # Database migrations
│   │   └── config/           # Database configuration
│   └── modules/              # Dynamically loaded modules
```

### Frontend (React)
```
frontend/
├── src/
│   ├── App.js                # Main app with dynamic component loading
│   ├── components/
│   │   └── ModuleLoader.js   # Module management UI
│   └── modules/              # Dynamically loaded module components
```

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16+)
- MySQL
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
# Configure database in src/database/config/config.json
npm run migrate  # Run database migrations
npm start        # Start backend server (port 3001)
```

### Frontend Setup
```bash
cd frontend
npm install
npm start        # Start frontend server (port 3000)
```

### Database Setup
1. Create MySQL database: `modular_project`
2. Run migrations: `cd backend && npx sequelize-cli db:migrate`
3. Update database credentials in `backend/src/database/config/config.json`

## 🔧 API Endpoints

### Module Management
- `GET /api/modules` - Get all modules (with active status)
- `POST /api/modules/upload` - Upload new module (ZIP file)
- `PUT /api/modules/:id/toggle` - Toggle module active/inactive status
- `DELETE /api/modules/:id` - Delete module
- `POST /api/modules/:id/execute` - Execute module
- `POST /api/modules/reload` - Reload all modules

### Todo Module (when active)
- `GET /api/modules/[module-path]/todos` - Get all todos
- `POST /api/modules/[module-path]/todos` - Create todo
- `GET /api/modules/[module-path]/todos/:id` - Get todo by ID
- `PUT /api/modules/[module-path]/todos/:id` - Update todo
- `DELETE /api/modules/[module-path]/todos/:id` - Delete todo

### User Module (when active)
- `GET /api/modules/[module-path]/users` - Get all users
- `POST /api/modules/[module-path]/users` - Create user
- `GET /api/modules/[module-path]/users/:id` - Get user by ID
- `PUT /api/modules/[module-path]/users/:id` - Update user
- `DELETE /api/modules/[module-path]/users/:id` - Delete user

## 📁 Module Structure

Each module must follow this structure in the ZIP file:

```
module.zip
├── module.json          # Module metadata
├── backend/
│   ├── routes.js       # Express routes
│   ├── controllers/
│   │   └── [name]Controller.js
│   └── models/
│       └── [name].js   # Sequelize model
└── frontend/
    ├── components/
    │   ├── index.js   # Component exports
    │   └── [Name]Manager.js # React component
    └── (optional files)
```

### module.json Format
```json
{
  "name": "Todo Manager",
  "version": "1.0.0",
  "description": "Complete Todo CRUD application",
  "author": "Module Developer"
}
```

## 🎯 Usage

### Creating a New Module

1. **Create Module Structure** (see above)
2. **ZIP the module** with proper structure
3. **Upload via Frontend**:
   - Go to Module Management section
   - Click "Choose Module File"
   - Select your ZIP file
   - Module will be automatically extracted and loaded

### Managing Modules

1. **View All Modules**: Module Management section shows all uploaded modules
2. **Activate/Deactivate**: Use toggle buttons to show/hide modules
3. **Delete Modules**: Remove unwanted modules
4. **Execute Modules**: Run module-specific initialization code

### Module Status

- **Active**: Module UI is visible, APIs are accessible
- **Inactive**: Module is hidden from UI, APIs still exist but not used
- **Visual Indicators**: Inactive modules appear grayed out with "(Inactive)" label

## 🔄 Dynamic Loading Process

1. **Upload**: ZIP file uploaded to `/api/modules/upload`
2. **Extraction**: Automatic extraction to `backend/src/modules/[timestamp]-[name]/`
3. **Registration**: Module metadata saved to database
4. **Route Mounting**: Dynamic routes created at `/api/modules/[path]/`
5. **Component Loading**: Frontend dynamically imports module components
6. **API Path Resolution**: URLs automatically updated with correct paths

## 🛠️ Development

### Adding New Module Types

1. Follow the module structure above
2. Create Sequelize models for data persistence
3. Implement Express routes and controllers
4. Create React components for UI
5. Use `MODULE_PATH` placeholder in frontend code (automatically replaced)
6. Test upload and functionality

### Database Migrations

```bash
cd backend
npx sequelize-cli migration:generate --name your-migration-name
npx sequelize-cli db:migrate
```

### Module Debugging

- Check server logs for module loading messages
- Use browser dev tools for frontend component loading
- Test APIs with tools like Postman or curl
- Check database for module registration

## 🚨 Troubleshooting

### Common Issues

1. **Module not loading**: Check ZIP structure and module.json
2. **API 404 errors**: Verify module is active and routes are mounted
3. **Component not rendering**: Check import paths and component exports
4. **Database errors**: Run migrations and check MySQL connection

### Debug Commands

```bash
# Check module loading
curl http://localhost:3001/api/modules

# Test module API
curl http://localhost:3001/api/modules/[module-path]/[endpoint]

# Reload modules
curl -X POST http://localhost:3001/api/modules/1/reload
```

## 📝 Notes

- Modules are loaded dynamically without server restart
- Active modules only show in frontend UI
- All modules remain accessible via API regardless of status
- Database migrations required for new module types
- Frontend uses dynamic imports for component loading

## 🤝 Contributing

1. Follow the established module structure
2. Test thoroughly before uploading
3. Update documentation for new features
4. Ensure backward compatibility

---

**Built with**: Node.js, Express, React, MySQL, Sequelize
**Architecture**: Modular, Extensible, Dynamic Loading