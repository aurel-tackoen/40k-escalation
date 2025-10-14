# Auth0 Interface Guide - Triggers vs Flows

## Understanding Auth0 Dashboard Versions

Auth0 has two interface versions for managing Actions:

### Newer Dashboard (What You Have)
- **Actions** → **Triggers**
- Shows: Login, Post-Login, Machine to Machine, etc.

### Older Dashboard
- **Actions** → **Flows** → **Login**
- Same functionality, different navigation

Both work the same way! Just different menu names.

---

## Your Step-by-Step Guide (Triggers Interface)

### Step 1: Create the Action

1. **Actions** → **Library**
2. Click **+ Build Custom** (top right)
3. Fill in:
   - **Name**: `Add Roles to Token`
   - **Trigger**: Select `Login / Post Login` from dropdown
   - **Runtime**: Node 18 (or latest available)
4. Click **Create**

### Step 2: Add the Code

Replace everything in the editor with:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://40k-escalation.app';
  
  const roles = event.authorization?.roles || [];
  
  let primaryRole = 'user';
  if (roles.includes('admin')) {
    primaryRole = 'admin';
  } else if (roles.includes('organizer')) {
    primaryRole = 'organizer';
  }
  
  api.idToken.setCustomClaim(`${namespace}/role`, primaryRole);
  api.idToken.setCustomClaim(`${namespace}/roles`, roles);
  api.accessToken.setCustomClaim(`${namespace}/role`, primaryRole);
  api.accessToken.setCustomClaim(`${namespace}/roles`, roles);
};
```

Click **Deploy** (top right)

### Step 3: Add to Login Trigger

1. **Actions** → **Triggers** (in left sidebar)
2. Click on **Login** (or **Post-Login**)
3. You'll see a diagram:
   ```
   ┌───────┐          ┌──────────┐
   │ Start │ ────────>│ Complete │
   └───────┘          └──────────┘
   ```
4. Look for **Custom** tab on the right sidebar
5. You should see your action: **Add Roles to Token**
6. **Drag it** from the Custom tab and drop it on the line between Start and Complete
7. Now it should look like:
   ```
   ┌───────┐     ┌──────────────────┐     ┌──────────┐
   │ Start │ ──> │ Add Roles to Token│ ──> │ Complete │
   └───────┘     └──────────────────┘     └──────────┘
   ```
8. Click **Apply** (top right)

### Step 4: Verify It's Active

1. The action should appear in the diagram
2. There should be a green checkmark or indicator
3. The trigger is now active!

---

## Visual Navigation Map

```
Auth0 Dashboard
│
├── Actions (left sidebar)
│   │
│   ├── Library
│   │   └── Build Custom → Create your action here
│   │
│   └── Triggers (or Flows on older dashboards)
│       └── Login → Add your action to the trigger here
│
└── User Management
    │
    ├── Roles → Create roles (admin, organizer, user)
    │
    └── Users → Assign roles to users
```

---

## Common Confusion Points

### Q: I don't see "Flows", only "Triggers"
**A:** That's fine! It's the newer interface. Same thing, different name.

### Q: Where is the Custom tab?
**A:** It's on the **right side** of the screen when you're viewing a trigger/flow. You might need to scroll or look for a panel labeled "Custom Actions".

### Q: Can I drag the action?
**A:** Yes! Click and hold on the action name in the Custom tab, then drag it to the line between Start and Complete.

### Q: What if I can't drag it?
**A:** Make sure:
- The action is deployed (green checkmark in Library)
- You're on the correct trigger (Login / Post-Login)
- Try refreshing the page

### Q: How do I know it worked?
**A:** 
1. The action appears in the diagram
2. When you click Apply, you see a success message
3. When you login to your app, roles appear in the console

---

## Troubleshooting

### Action doesn't appear in Custom tab
- Go back to Library
- Find your action
- Make sure it shows "Deployed" status
- Check the Trigger type is "Login / Post Login"

### Can't apply changes
- Make sure you clicked Deploy in the action editor
- Try refreshing the Triggers page
- Check Auth0 status page for any outages

### Still seeing "user" for all users
- Verify the action is in the trigger diagram
- Check you assigned roles to users in User Management
- Clear browser cookies and login again
- Check Auth0 Monitoring → Logs for any errors

---

## Quick Reference

| Old Name | New Name | What It Is |
|----------|----------|------------|
| Flows | Triggers | Where you manage action execution |
| Login Flow | Login Trigger | When actions run during login |
| Custom Actions | Custom | Your custom-built actions |
| Add to Flow | Add to Trigger | Activate the action |

---

## Need More Help?

1. Check **Monitoring** → **Logs** in Auth0 Dashboard
2. Look for login events
3. Check for any error messages
4. Review the action execution logs

The guide is updated! Use "Triggers" instead of "Flows" - they work exactly the same way.
