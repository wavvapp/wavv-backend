# Wavv Backend

## Project Overview

WAVV Backend is a server-side application designed to manage and process data for the WAVV platform. It provides a robust API for handling user authentication, group management, signal processing, and more.

## Features

- **User Authentication**: Secure user login and registration using JWT.
- **Group Management**: Create and manage user groups.
- **Signal Processing**: Handle and process signals for real-time updates.
- **Invitation System**: Send and manage invitations for users.
- **Notification Service**: Manage user notifications efficiently.

## Installation

To set up the WAVV Backend locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd wavv-backend
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Set up environment variables**:
   - Copy the `.env.example` file to `.env` and fill in the required environment variables.

4. **Build the project**:
   ```bash
   pnpm run build
   ```

5. **Run database migrations**:
   ```bash
   pnpm run migration:run
   ```

## Usage

- **Start the server**:
  ```bash
  pnpm start
  ```

- **Development mode**:
  ```bash
  pnpm run dev
  ```
