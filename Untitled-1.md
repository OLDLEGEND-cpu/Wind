Build a complete, working full-stack AI chatbot web app called **Wind AI**.

Do not spend the response explaining the project. **Build it.**

## CORE

Wind is an original AI chatbot inspired by the general usability of Gemini/ChatGPT, but with its own branding and UI.

It must be a real application, not a static mockup.

Use:

* Frontend: choose the best modern option
* Backend: choose the best option
* Database: MySQL
* AI: Google Gemini API
* Authentication: secure user authentication
* API key: read from `GEMINI_API_KEY` environment variable

I will add the real Gemini API key myself later. **Do not ask me for it and do not hard-code one.**

## UI

Create a premium, clean, modern **light-first** interface.

Wind should feel like a polished AI product.

Use:

* Professional typography
* Soft neutral colors
* Clean spacing
* Rounded components
* Subtle borders/shadows
* Responsive design
* Optional dark mode
* Smooth but restrained animations

Do NOT copy Gemini's exact design, branding, logo, colors, or assets.

Do NOT use unnecessary emojis.

## USER APP

Create:

* Landing page
* Login
* Sign up
* Forgot/reset password
* Main AI chat
* Chat history
* Profile
* Settings
* Help
* Privacy
* Terms
* 404/error pages

### Chat

The main chat must support:

* New conversation
* Conversation history
* Send messages
* AI responses
* Streaming responses
* Markdown
* Code blocks
* Syntax highlighting
* Copy response
* Regenerate response
* Edit message
* Stop generation
* Retry failed response
* Suggested prompts
* Auto-scroll
* Loading state
* Empty state
* Error state
* Mobile responsive layout

Save conversations and messages in MySQL.

Users can:

* Rename conversations
* Delete conversations
* Search conversations
* Open previous conversations
* Continue conversations

Create the architecture so file/image input can be expanded later.

## AI

Integrate Google Gemini through the **backend**, never directly from the browser.

Use:

`GEMINI_API_KEY`

Create an AI service/provider layer so the model can be changed later.

Handle:

* Conversation context
* Streaming
* Errors
* Timeouts
* Retries
* Rate limits
* Usage tracking

Use a currently supported Gemini model.

## DATABASE

Use MySQL.

Create appropriate tables for:

* Users
* Sessions/authentication
* Conversations
* Messages
* User settings
* Usage
* API logs
* Audit logs

Use proper:

* Primary keys
* Foreign keys
* Indexes
* Constraints
* Timestamps
* Relationships

Create migrations/schema.

## ADMIN

Create a secure admin dashboard with:

* Dashboard
* User management
* User details
* Usage statistics
* Conversation statistics
* AI/API monitoring
* Error logs
* API logs
* Audit logs
* System settings
* Admin profile

Implement role-based authorization.

## SECURITY

Use professional security practices:

* Password hashing
* Secure authentication
* Authorization/RBAC
* Input validation
* SQL injection protection
* XSS protection
* Rate limiting
* Secure headers
* Upload validation
* Environment variables
* Safe error handling

Never expose the Gemini API key to the frontend.

## RESPONSIVE DESIGN

Make everything work properly on:

* Desktop
* Laptop
* Tablet
* Mobile

Use accessible semantic HTML, keyboard navigation, focus states, labels, and good contrast.

## PERFORMANCE

Keep the application fast.

Optimize:

* Database queries
* Chat rendering
* API requests
* Streaming
* Conversation loading

Use pagination where appropriate.

## PROJECT STRUCTURE

Create a clean maintainable structure separating:

* Frontend
* Backend
* Components
* Pages/routes
* Services
* API
* Database
* Authentication
* Middleware
* Validation
* Admin
* Configuration
* Shared utilities/types

Avoid unnecessary dependencies and duplicate code.

## BRAND

Brand name:

**Wind AI**

Create simple original dummy branding:

* Logo
* Favicon
* Professional light color palette
* Dummy company information

## IMPORTANT

This is a practice project, but build it with professional architecture.

Do NOT:

* Create only a frontend mockup
* Use fake AI responses for the real chat
* Put the API key in frontend code
* Hard-code secrets
* Stop after creating a few pages
* Spend huge amounts of output explaining every decision
* Ask me unnecessary questions

If something is unspecified, make a sensible engineering decision and continue.

## BUILD ORDER

Build in this order:

1. Project setup
2. Database
3. Authentication
4. Backend API
5. Gemini integration
6. Chat interface
7. Conversation persistence
8. Chat history
9. Settings/profile
10. Admin dashboard
11. Security
12. Responsive UI
13. Final polish

After implementation, check for broken imports, routes, database issues, API errors, authentication problems, responsive issues, and console errors.

**The final result must be a functioning Wind AI chatbot, not a specification or prototype.**

Start building now.
