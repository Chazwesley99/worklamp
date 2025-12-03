# Worklamp Testing Guide

## 🚀 Getting Started

Now you can actually test the features! Here's what's available and how to access them.

## 📍 Available Pages

### 1. **Home Page** - `http://localhost:3000/`

- **What you'll see:** A beautiful landing page with:
  - Feature overview cards
  - Status of implemented features
  - Quick navigation links
  - Links to all available pages

### 2. **Dashboard** - `http://localhost:3000/dashboard`

- **What you'll see:**
  - Full sidebar navigation
  - Project list with create/edit functionality
  - Notification bell (placeholder for now)
  - User menu
- **What you can do:**
  - Create new projects
  - View all your projects
  - Edit project details
  - See project status badges

### 3. **Projects Page** - `http://localhost:3000/projects`

- **What you'll see:**
  - Same as dashboard but focused on projects
  - Click any project to go to settings
- **What you can do:**
  - Create projects (respects subscription limits)
  - Edit projects
  - View project details

### 4. **Project Settings** - `http://localhost:3000/projects/[id]/settings`

- **What you'll see:**
  - Full project configuration form
  - Status dropdown (active/completed/archived)
  - Public access toggles
  - Danger zone with delete confirmation
- **What you can do:**
  - Update project name and description
  - Change project status
  - Enable/disable public bug tracking
  - Enable/disable public feature requests
  - Delete projects (with confirmation)

### 5. **Profile Page** - `http://localhost:3000/profile`

- **What you'll see:**
  - Profile information form
  - Theme toggle (light/dark mode)
  - Password change form (for email users)
- **What you can do:**
  - Update your name
  - Upload profile picture
  - Change password
  - Toggle dark mode

### 6. **Team Page** - `http://localhost:3000/team`

- **What you'll see:**
  - Tenant information
  - Team member list with roles
  - Invite user form (for owners/admins)
- **What you can do:**
  - View subscription tier and limits
  - See all team members
  - Invite new members (with role selection)
  - Remove members
  - Update member roles

## 🎨 UI Features to Test

### Navigation

- ✅ Sidebar collapses on mobile
- ✅ Active route highlighting
- ✅ Click outside to close dropdowns
- ✅ Keyboard navigation (ESC to close modals)

### Dark Mode

- ✅ Toggle in profile page
- ✅ Persists across page reloads
- ✅ All components support dark mode

### Responsive Design

- ✅ Mobile-friendly layouts
- ✅ Touch-friendly buttons
- ✅ Adaptive grids

### Forms & Modals

- ✅ Real-time validation
- ✅ Loading states
- ✅ Error messages
- ✅ Success feedback

## 🧪 Test Scenarios

### Scenario 1: Create Your First Project

1. Go to `http://localhost:3000/dashboard`
2. Click "New Project" button
3. Fill in project name (required)
4. Add description (optional)
5. Toggle public access options
6. Click "Create Project"
7. ✅ Project appears in the list

### Scenario 2: Edit a Project

1. From dashboard, click "Edit" on any project
2. Or go to Projects page and click a project card
3. Update any fields
4. Click "Save Changes"
5. ✅ Changes are reflected immediately

### Scenario 3: Manage Team Members

1. Go to `http://localhost:3000/team`
2. View current team members
3. Click "Send Invitation" (if you're owner/admin)
4. Enter email and select role
5. ✅ Invitation sent (email functionality pending)

### Scenario 4: Update Your Profile

1. Go to `http://localhost:3000/profile`
2. Update your name
3. Upload a profile picture
4. Toggle dark mode
5. ✅ Changes save automatically

### Scenario 5: Test Subscription Limits

1. Try creating more projects than your tier allows
2. ✅ You should see an error: "Project limit reached"
3. Try inviting more members than allowed
4. ✅ You should see an error: "Team member limit reached"

## 🔍 What to Look For

### ✅ Working Features

- Project CRUD operations
- Form validation
- Error handling
- Loading states
- Dark mode toggle
- Responsive layouts
- Modal dialogs
- Dropdown menus
- Sidebar navigation

### ⚠️ Known Limitations

- **Authentication:** Currently using placeholder auth. Full login/signup flow needs integration.
- **Real-time Updates:** Notifications use polling (30s). WebSocket integration coming.
- **Project Context:** Selected project doesn't persist across navigation yet.
- **API Errors:** Some API calls may fail if backend isn't running or database isn't seeded.

## 🐛 If Something Doesn't Work

### Backend Not Running?

```bash
cd backend
npm run dev
```

### Frontend Not Running?

```bash
cd frontend
npm run dev
```

### Database Not Seeded?

```bash
cd backend
npx prisma db push
npx prisma db seed
```

### Clear Browser Cache

- Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Or open DevTools and disable cache

## 📊 Current Implementation Status

### ✅ Completed (Task 6)

- [x] Project CRUD API
- [x] Project frontend components
- [x] Dashboard layout with sidebar
- [x] Notification bell component
- [x] Modal dialogs
- [x] Form components (Input, Textarea, Checkbox, Select)
- [x] Responsive navigation
- [x] Dark mode support

### 🚧 Coming Next (Tasks 7-29)

- [ ] Task Management System
- [ ] Bug Tracking
- [ ] Feature Requests
- [ ] Milestones & Timeline
- [ ] Team Chat
- [ ] Real-time WebSocket updates
- [ ] AI Assistant
- [ ] And much more...

## 💡 Tips for Testing

1. **Open DevTools** - Check the Console and Network tabs for errors
2. **Test Dark Mode** - Toggle it and navigate between pages
3. **Try Mobile View** - Resize browser or use DevTools device emulation
4. **Test Form Validation** - Try submitting empty forms
5. **Check Responsiveness** - Resize window to see mobile menu
6. **Test Keyboard Navigation** - Use Tab, Enter, and ESC keys

## 🎯 Next Steps

After testing these features, we'll move on to:

1. **Task Management** (Task 7) - Create, assign, and track tasks
2. **Real-Time Infrastructure** (Task 9) - WebSocket for live updates
3. **Bug Tracking** (Task 10) - Report and vote on bugs
4. **Feature Requests** (Task 11) - Collect and prioritize features

---

**Questions or Issues?** Let me know what's not working and I'll fix it!
