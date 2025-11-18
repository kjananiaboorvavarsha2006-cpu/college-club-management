# Database Schema Design

## Overview
The College Club Management Platform uses MongoDB as its database. The schema is designed to efficiently manage users, clubs, events, memberships, user streaks, and badges.

## Collections

### 1. Users Collection
Stores user information and authentication details.

**Fields:**
- `_id` (ObjectId): Primary key
- `name` (String, required): User's full name
- `email` (String, required, unique): User's email address
- `password` (String, required): Hashed password
- `studentId` (String, required, unique): Student ID
- `major` (String, required): User's major/field of study
- `role` (String, enum: ['user', 'admin'], default: 'user'): User role
- `emailVerified` (Boolean, default: false): Email verification status
- `createdAt` (Date, default: Date.now): Account creation timestamp

**Indexes:**
- Unique index on `email`
- Unique index on `studentId`

### 2. Clubs Collection
Stores information about student clubs.

**Fields:**
- `_id` (ObjectId): Primary key
- `name` (String, required, unique): Club name
- `description` (String, required): Club description
- `category` (String, required, enum: ['academic', 'arts', 'sports', 'technology', 'social', 'volunteer']): Club category
- `creator` (ObjectId, ref: 'User', required): Club creator
- `members` (Array of ObjectId, ref: 'User'): Club members
- `createdAt` (Date, default: Date.now): Club creation timestamp

**Indexes:**
- Unique index on `name`

### 3. Events Collection
Stores information about club events.

**Fields:**
- `_id` (ObjectId): Primary key
- `title` (String, required): Event title
- `description` (String, required): Event description
- `date` (Date, required): Event date
- `time` (String, required): Event time
- `location` (String, required): Event location
- `club` (ObjectId, ref: 'Club', required): Organizing club
- `attendees` (Array of ObjectId, ref: 'User'): Event attendees
- `createdAt` (Date, default: Date.now): Event creation timestamp

### 4. Memberships Collection
Stores membership information linking users and clubs.

**Fields:**
- `_id` (ObjectId): Primary key
- `user` (ObjectId, ref: 'User', required): User ID
- `club` (ObjectId, ref: 'Club', required): Club ID
- `joinDate` (Date, default: Date.now): Membership join date
- `leaveDate` (Date): Membership leave date (null if active)
- `isActive` (Boolean, default: true): Membership status

**Indexes:**
- Compound unique index on `user` and `club` (partial filter: { isActive: true })

### 5. Streaks Collection
Stores user activity streak information.

**Fields:**
- `_id` (ObjectId): Primary key
- `user` (ObjectId, ref: 'User', required, unique): User ID
- `currentStreak` (Number, default: 0): Current consecutive days of activity
- `lastActiveDate` (Date, default: Date.now): Last active date
- `longestStreak` (Number, default: 0): Longest streak achieved
- `totalActiveDays` (Number, default: 0): Total active days
- `createdAt` (Date, default: Date.now): Record creation timestamp

**Indexes:**
- Unique index on `user`

### 6. Badges Collection
Stores badge information for users.

**Fields:**
- `_id` (ObjectId): Primary key
- `user` (ObjectId, ref: 'User', required): User ID
- `type` (String, required, enum: ['bronze', 'silver', 'gold', 'diamond', 'club-joiner', 'event-goer']): Badge type
- `earnedDate` (Date, default: Date.now): Badge