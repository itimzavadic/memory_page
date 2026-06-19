Generate QR code for this URL
Save QR files to filesystem

Storage:
/uploads/qr

Generate:

PNG (for preview)
SVG (for engraving/manufacturing)

QR requirements:

high error correction
print-friendly
laser engraving compatible
scannable after physical engraving
sharp vector export

Admin must be able to:

preview QR
download PNG
download SVG
regenerate QR if needed

====================================================
FILE STORAGE

Images stored on server filesystem:

/uploads/images

QR stored in:

/uploads/qr

Requirements:

validate file type
validate file size
safe filenames
prevent path traversal

Allowed image types:

jpg
jpeg
png
webp

====================================================
SECURITY REQUIREMENTS

Implement:

password hashing
secure cookie sessions
route protection middleware
server-side validation
XSS sanitization
CSRF protection strategy
secure file upload handling

Never store plaintext passwords.

====================================================
DATABASE REQUIREMENTS

Use SQLite with Drizzle migrations.

Need:

schema definitions
migrations
seed script for first admin user

Database should support future expansion:

payments
subscriptions
memorial plans
analytics

====================================================
CODE QUALITY RULES

Mandatory:

strict TypeScript
production-ready code
reusable components
clean architecture
maintainable code
readable naming

Avoid:

overengineering
giant files
unnecessary libraries
duplicate logic

Component rule:
Prefer components under 250 lines.

====================================================
WORKFLOW

Implement in phases.

Phase 1:
Architecture analysis and project scaffolding

Phase 2:
Database schema and Drizzle setup

Phase 3:
Authentication

Phase 4:
Admin dashboard

Phase 5:
Public memorial pages

Phase 6:
Image upload system

Phase 7:
QR code generation

Phase 8:
SEO and deployment

At the beginning:
Provide architecture analysis and implementation plan before generating code.

You are a senior software architect and full-stack engineer.

Your task is to design and implement a production-ready memorial website platform with QR-code support and a private admin panel.

Before writing code:

Analyze architecture
Explain technical decisions
Propose folder structure
Identify possible risks
Then implement step by step

Do not start coding immediately.

====================================================
PROJECT OVERVIEW

Build a memorial website platform.

Main business model:
Each deceased person gets a dedicated memorial page hosted on the website.

A unique QR code is generated for each memorial page.

The QR code is physically engraved on a memorial plaque by third-party contractors and attached to gravestones or monuments.

When someone scans the QR code, they are redirected to the memorial page.

System must prioritize:

long-term stability
permanent URL compatibility
high reliability
easy content management

Only one admin user is required for MVP.

====================================================
TECH STACK (MANDATORY)

Frontend + Backend:

Next.js (App Router)
TypeScript
Tailwind CSS

Database:

SQLite

ORM:

Drizzle ORM

Authentication:

Session-based authentication using secure cookies

QR generation:

Generate both PNG and SVG QR files

Deployment target:

Standard Linux VPS hosting
Node.js runtime
Nginx reverse proxy
No serverless architecture
No Vercel-only features

Process management:

PM2 or Docker-compatible setup

====================================================
ARCHITECTURE REQUIREMENTS

Use monolithic architecture.

Admin panel, backend APIs, and public website must exist inside the same project.

Folder structure should be clean and maintainable.

Preferred structure:

/app
/components
/lib
/db
/services
/types
/uploads
/public

Separate business logic from UI.

====================================================
CORE DOMAIN ENTITY

Entity: MemorialPage

Fields:

id
publicId
slug
fullName
birthDate
deathDate
epitaph
biography
coverPhoto
galleryImages[]
videoUrls[]
cemeteryLocation
qrCodePngPath
qrCodeSvgPath
qrTargetUrl
qrGeneratedAt
qrVersion
isPublished
createdAt
updatedAt

Rules:

id is internal database ID
publicId is immutable and permanent
slug is editable
slug must be unique
publicId never changes
QR codes must always reference publicId-based URLs

====================================================
URL STRATEGY

IMPORTANT:

QR codes must NEVER point directly to slug-based URLs.

Reason:
Slug may change after publication, but engraved QR plaques cannot be changed.

Use permanent publicId-based URL for QR:

/m/[publicId]

Example:
site.com/m/AB29KD82

Optional SEO-friendly route:
/memorial/[slug]

Behavior:

QR scans open /m/[publicId]
Server resolves publicId
Server redirects or renders memorial page

This guarantees QR permanence even if slug changes.

====================================================
PUBLIC WEBSITE REQUIREMENTS

Public routes:

/
Landing page

/m/[publicId]
Permanent memorial route used by QR

/memorial/[slug]
Optional SEO-friendly route

Each memorial page must support:

hero section with cover photo
full name
birth/death dates
epitaph
biography
photo gallery
optional embedded videos
optional cemetery location
responsive layout

SEO requirements:

dynamic title
meta description
Open Graph tags
sitemap generation
semantic HTML

Performance:

lazy loading
optimized images
fast page load
mobile first

====================================================
ADMIN PANEL REQUIREMENTS

Admin routes:

/admin/login
/admin/dashboard
/admin/memorials
/admin/memorials/new
/admin/memorials/[id]/edit

Admin capabilities:

login/logout
create memorial
edit memorial
delete memorial
publish/unpublish memorial
preview memorial
upload cover photo
upload gallery photos
manage videos
download QR code

Dashboard UI:

clean
practical
minimal
desktop-first

====================================================
QR CODE REQUIREMENTS

When memorial page is published:

Generate permanent publicId
Create permanent URL:
    site.com/m/[publicId]