#!/bin/bash
# Setup script for Python report generator environment (macOS/Linux)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/venv"
PYTHON_CMD="python3"

echo "Setting up Python environment for SubSentry report generator..."
echo "Script directory: $SCRIPT_DIR"

# Check if python3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: python3 is not installed or not in PATH"
    echo "Please install Python 3.8+ and try again"
    exit 1
fi

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo "Found Python version: $PYTHON_VERSION"

# Create virtual environment if it doesn't exist
if [ ! -d "$VENV_DIR" ]; then
    echo "Creating virtual environment..."
    "$PYTHON_CMD" -m venv "$VENV_DIR"
    if [ $? -ne 0 ]; then
        echo "❌ Error: Failed to create virtual environment"
        exit 1
    fi
    echo "✅ Virtual environment created at $VENV_DIR"
else
    echo "Virtual environment already exists at $VENV_DIR"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source "$VENV_DIR/bin/activate"

# Verify activation
if [ -z "$VIRTUAL_ENV" ]; then
    echo "❌ Error: Failed to activate virtual environment"
    exit 1
fi

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip --quiet

# Install dependencies
echo "Installing Python dependencies..."
if [ ! -f "$SCRIPT_DIR/requirements.txt" ]; then
    echo "❌ Error: requirements.txt not found at $SCRIPT_DIR/requirements.txt"
    exit 1
fi

pip install -r "$SCRIPT_DIR/requirements.txt"

# Verify installation
echo "Verifying installation..."
python -c "import pandas, matplotlib, mysql.connector, reportlab; print('✅ All dependencies installed successfully')" 2>/dev/null || {
    echo "❌ Error: Some dependencies failed to install"
    exit 1
}

echo ""
echo "✅ Python environment setup complete!"
echo ""
echo "Python interpreter location:"
echo "  $VENV_DIR/bin/python"
echo ""
echo "The Java backend will auto-detect this venv Python."
echo "No additional configuration needed if running from the backend directory."
echo ""
echo "To activate the venv manually:"
echo "  source $VENV_DIR/bin/activate"
echo ""
echo "To deactivate:"
echo "  deactivate"

