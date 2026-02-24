# Project: Escala Porteiros 2026

## Overview
A responsive web application for managing the 2026 schedule of church doorkeepers ("Irmãos Porteiros").
Built with React, TypeScript, Vite, and Tailwind CSS.

## Key Features
- **Automatic Scheduling**: Generates a schedule from March 1st, 2026 to Dec 31st, 2026.
- **Rules Engine**:
  - **Sundays**: Morning + Night.
  - **Wednesdays**: Night only.
  - **Saturdays**: 1st Sat (Afternoon + Night), Others (Night).
  - **Exception**: 07/06/2026 (Santa Ceia - No brothers).
  - **Constraints**:
    - Thiago: 2x/month (Wed Night only).
    - Williams: 3x/month (Any day).
    - Adilson: Sun Night only.
    - Eduardo, Elson, Carlos Henrique: No Wednesdays.
    - Others: Balanced distribution.
- **Design System**: Implements a custom Design System using CSS variables (tokens) mapped to Tailwind.
- **Mobile-First**: Optimized list view for mobile.

## Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + CSS Variables (Design System Tokens)
- **Icons**: Lucide React
- **Date Handling**: date-fns (pt-BR locale)

## Deployment
- **Platform**: Youware (root path).
- **Base Path**: Root (`/`).

## Design System Tokens
- Colors: `text-primary`, `surface-page`, `action-primary`, `status-warning`, etc.
- Spacing: `space-1` to `space-20`.
- Typography: `text-xs` to `text-5xl`.
- Radius: `radius-sm` to `radius-full`.

## Recent Changes
- **2026 Update**: Switched year to 2026, updated participants list.
- **Design System**: Implemented strict Design System tokens.
- **Logic Update**: Removed Tuesdays, added Santa Ceia exception.
