# VTT Companion Monorepo 👋

This project is separated into a monorepo structure with frontend, backend, and shared folders.

## Folder Directory
- **`frontend/`**: The React Native/Expo VTT companion application.
- **`backend/`**: A placeholder Express VTT backend service.
- **`shared/`**: Shared schemas and TypeScript models between frontend and backend.

## How to Run

To run the application, you can execute the commands directly from the root workspace directory or navigate into the specific folder.

### From Root Directory
- **Start Frontend (Expo Dev Server)**:
  ```bash
  npm start
  ```
- **Start Frontend Web**:
  ```bash
  npm run web
  ```
- **Start Backend (Express Server)**:
  ```bash
  npm run backend
  ```

### By Navigating
- **Frontend Development**:
  ```bash
  cd frontend
  npx expo start
  ```
- **Backend Development**:
  ```bash
  cd backend
  npm start
  ```
