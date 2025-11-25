# CoMAP Backend

This is the backend service for the CoMAP project.

## Project Structure

- `app/` - Main application logic, including routes, services, and extensions
- `blueprints/` - Flask blueprints for modular route organization (chat, map, user)
- `instance/` - Instance-specific files (ignored by git)
- `logs/` - Application log files
- `test/` - Test scripts and test cases
- `agents.py`, `llm.py`, `models.py`, `export.py`, `log.py` - Core modules
- `run.py` - Entry point to start the backend server
- `requirements.txt` - Python dependencies
- `.gitignore` - Git ignore rules

## Installation

1. **Clone the repository**

   ```sh
   git clone this repository
   cd backend
   ```

2. **Create a virtual environment (optional but recommended)**

   ```sh
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. **Install dependencies**

   ```sh
   pip install -r requirements.txt
   ```

## Running the Project

Start the backend server with:

```sh
python run.py
```

The server will start and listen for requests as configured in your application.

## Notes
- Make sure to configure any required environment variables in a `.env` file (not tracked by git).
- The `instance/` directory is used for instance-specific files and is ignored by git.
- For development and debugging, logs are stored in the `logs/` directory.
