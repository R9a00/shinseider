# attg

This is the project for the "アトツギ甲子園用システム".

## Directory Structure

- `backend/`: Contains the FastAPI backend application.
- `frontend/`: Contains the React frontend application.

## How to Run

### Backend

1. Navigate to the `backend` directory:
   ```sh
   cd attg/backend
   ```
2. Create a virtual environment:
   ```sh
   python -m venv venv
   ```
3. Activate the virtual environment:
   ```sh
   source venv/bin/activate
   ```
4. Install the dependencies:
   ```sh
   pip install -r requirements.txt
   ```
5. Run the application:
   ```sh
   uvicorn main:app --reload --port 8888
   ```

### Frontend

1. Navigate to the `frontend/client` directory:
   ```sh
   cd attg/frontend/client
   ```
2. Install the dependencies:
   ```sh
   npm install
   ```
3. Run the application:
   ```sh
   npm start
   ```