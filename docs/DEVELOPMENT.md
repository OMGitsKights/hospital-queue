# Development Guide

## Environment Setup

### 1. Backend (Flask)

**Prerequisites**: Python 3.8+

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Create a virtual environment (recommended):
    ```bash
    python -m venv venv
    source venv/bin/activate  # Windows: venv\Scripts\activate
    ```

3.  Install dependencies:
    *   Since there is no `requirements.txt` yet, install manually:
    ```bash
    pip install flask flask-cors werkzeug
    ```
    *   *Tip*: You can freeze the requirements for future use:
    ```bash
    pip freeze > requirements.txt
    ```

4.  Running the Server:
    ```bash
    python app.py
    ```
    The server listens on `0.0.0.0:5001`.

### 2. Frontend (React)

**Prerequisites**: Node.js and npm.

1.  Navigate to the root directory:
    ```bash
    cd .. # if in backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the Development Server:
    ```bash
    npm start
    ```
    The app will open at `http://localhost:3000`.

## Project Structure

*   `backend/`: Flask application and JSON storage.
    *   `app.py`: Main entry point.
    *   `*.json`: Data files.
*   `src/`: React source code.
    *   `components/`: (If organized) UI components.
    *   `App.js`: Main layout and routing.
    *   `translations.js`: Localization strings.
*   `public/`: Static assets (HTML, favicons).

## Coding Standards

*   **Frontend**: Follow strict React hooks rules. Use functional components.
*   **Backend**: PEP 8 style guide for Python code.
*   **Commits**: Use descriptive commit messages (e.g., "Fix: Handle null prescription error").

## Testing

*   **Frontend**: Run `npm test` to launch the Jest test runner.
*   **Backend**: Currently manual testing via Postman or Curl is recommended.
