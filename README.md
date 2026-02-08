# Smart Chemical Inventory System

A modern web-based application to manage laboratory chemical inventories efficiently and safely.

## Features

- **Dashboard**: Real-time statistics on total chemicals, expired items, and low stock alerts.
- **Inventory Management**: Add, view, search, and delete chemical records.
- **Reports**: Export inventory data to CSV for external analysis.
- **Settings**:
    - **Dark Mode**: Toggle for comfortable viewing in low-light environments.
    - **Default Lab**: Set a default lab name for faster data entry.
- **Visual Indicators**: Color-coded badges for hazard levels and expiry status.

## Technologies Used

- **Frontend**: HTML5, CSS3 (Custom + Bootstrap 5), JavaScript (Vanilla).
- **Backend**: Python (Flask).
- **Database**: SQLite (via SQLAlchemy).

## Prerequisites

- Python 3.8 or higher.
- `pip` (Python package installer).

## Installation

1.  **Clone the repository** (if applicable) or download the source code.
2.  **Navigate to the project directory**.

## Run Instructions

### Linux / macOS

1.  **Create a virtual environment** (optional but recommended):
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

2.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
    *(If `requirements.txt` is missing, install manually: `pip install flask flask-sqlalchemy flask-cors`)*

3.  **Run the application**:
    ```bash
    python3 app.py
    ```

4.  **Access the App**:
    Open your browser and go to `http://localhost:8000`.

### Windows

1.  **Create a virtual environment** (optional but recommended):
    ```powershell
    python -m venv venv
    .\venv\Scripts\activate
    ```

2.  **Install dependencies**:
    ```powershell
    pip install -r requirements.txt
    ```
    *(If `requirements.txt` is missing, install manually: `pip install flask flask-sqlalchemy flask-cors`)*

3.  **Run the application**:
    ```powershell
    python app.py
    ```

4.  **Access the App**:
    Open your browser and go to `http://localhost:8000`.

## Usage

- **Add Chemical**: Click the "Add New Chemical" button.
- **Search**: Use the search bar to filter chemicals by name.
- **Export**: Go to the "Reports" tab and click "Export to CSV".
- **Settings**: Go to the "Settings" tab to enable Dark Mode or set a Default Lab.
