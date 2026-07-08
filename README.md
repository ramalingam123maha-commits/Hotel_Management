# Hotel Management Login Page

A modern, responsive login page built with HTML, CSS, and JavaScript for the Hotel Management system.

## Features

### 🎨 **User Interface**
- **Clean & Modern Design**: Professional gradient background with animated floating circles
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile devices
- **Smooth Animations**: Slide-up animation on page load and interactive transitions
- **Eye-catching Elements**: Modern color scheme with purple-pink gradient

### 🔐 **Security & Validation**
- **Email Validation**: Built-in HTML5 email validation with custom error messages
- **Password Validation**: Minimum 6 characters required
- **Real-time Error Feedback**: Inline error messages for each field
- **Form Validation**: Prevents submission with empty fields

### 👁️ **User Experience**
- **Password Visibility Toggle**: Eye icon button to show/hide password
- **Remember Me Functionality**: Saves email to localStorage for convenience
- **Loading State**: Button shows "Logging in..." during authentication
- **Session Management**: Uses sessionStorage to maintain login state
- **Error Handling**: Clear, user-friendly error messages

### 📱 **Responsive Design**
- Mobile-first approach
- Works on all screen sizes
- Touch-friendly buttons and inputs
- Optimized spacing and typography

## Files Structure

```
index.html      - Login page markup
styles.css      - Complete styling and animations
script.js       - Form handling and validation logic
dashboard.html  - Sample dashboard after login
```

## Demo Credentials

Test the login with these credentials:
- **Email**: `admin@hotel.com`
- **Password**: `password123`

## How to Use

1. **Open the login page** - Navigate to `index.html` in your browser
2. **Enter credentials** - Use email and password fields
3. **Toggle password** - Click the eye icon to show/hide password
4. **Check "Remember me"** - To save email for future logins
5. **Click Login** - Submit the form to authenticate

## Form Validation Rules

| Field | Rules |
|-------|-------|
| Email | Required, valid email format |
| Password | Required, minimum 6 characters |

## JavaScript Features

### Functions Included:
- `handleLogin()` - Processes form submission
- `validateForm()` - Validates all fields
- `validateCredentials()` - Checks against demo credentials
- `togglePasswordVisibility()` - Shows/hides password
- `loadRememberedEmail()` - Restores saved email
- `showErrorMessage()` - Displays error messages
- `showSuccessMessage()` - Displays success messages
- `clearMessages()` - Clears all messages
- `simulateApiCall()` - Simulates backend API delay

## CSS Classes

### Main Containers:
- `.login-container` - Main wrapper
- `.login-card` - Central login form card
- `.login-background` - Animated background

### Form Elements:
- `.login-form` - Form wrapper
- `.form-group` - Individual form field group
- `.password-wrapper` - Password input with toggle button
- `.form-options` - Remember me & forgot password section

### Animations:
- `slideUp` - Initial page load animation
- `float` - Floating background circles animation

## Customization

### Change Demo Credentials:
Edit `script.js` line 12-15:
```javascript
const DEMO_CREDENTIALS = {
    email: 'your@email.com',
    password: 'yourpassword'
};
```

### Modify Colors:
Edit `styles.css` and change the gradient in body:
```css
body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Redirect After Login:
Edit `script.js` line 70 to change redirect URL:
```javascript
window.location.href = '/dashboard.html';
```

## Browser Compatibility

- Chrome/Edge (Latest)
- Firefox (Latest)
- Safari (Latest)
- Mobile browsers

## Future Enhancements

- [ ] Backend API integration
- [ ] Two-factor authentication
- [ ] Social login (Google, Facebook)
- [ ] Password reset functionality
- [ ] User registration page
- [ ] Email verification
- [ ] Session timeout

## Notes

- Current implementation uses demo credentials
- For production, replace with actual backend authentication
- Implement proper password hashing on the backend
- Use HTTPS for secure credential transmission
- Add CSRF protection for form submission

---

**Version**: 1.0  
**Last Updated**: 2024  
**Created for**: Hotel Management System
