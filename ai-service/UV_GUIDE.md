# Using uv with Ghostypedia AI Service

This guide explains how to use [uv](https://github.com/astral-sh/uv) for managing the Python AI service.

## What is uv?

uv is an extremely fast Python package installer and resolver, written in Rust. It's designed as a drop-in replacement for pip and pip-tools, but 10-100x faster.

### Key Benefits

- **Speed**: 10-100x faster than pip
- **Reliability**: Consistent dependency resolution
- **Simplicity**: Drop-in replacement for pip/venv workflows
- **Modern**: Built with modern Python packaging standards

## Installation

### macOS/Linux
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Homebrew
```bash
brew install uv
```

### pip
```bash
pip install uv
```

### Windows
```powershell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

For more options, see: https://docs.astral.sh/uv/getting-started/installation/

## Common Commands

### Initial Setup
```bash
# Install all dependencies (creates .venv automatically)
uv sync

# Install with dev dependencies
uv sync --all-extras
```

### Running the Service
```bash
# Run the Flask service
uv run python app/main.py

# Run the verification script
uv run python verify_setup.py

# Run tests
uv run python test_service.py
```

### Managing Dependencies

#### Adding Dependencies
```bash
# Add a production dependency
uv add package-name

# Add a dev dependency
uv add --dev pytest

# Add with version constraint
uv add "package-name>=1.0.0"
```

#### Removing Dependencies
```bash
uv remove package-name
```

#### Updating Dependencies
```bash
# Update all dependencies
uv sync --upgrade

# Update a specific package
uv add --upgrade package-name
```

#### Viewing Dependencies
```bash
# Show installed packages
uv pip list

# Show dependency tree
uv pip tree
```

### Working with Virtual Environments

uv automatically creates and manages a `.venv` directory. You don't need to manually activate it when using `uv run`.

If you want to activate it manually:
```bash
# macOS/Linux
source .venv/bin/activate

# Windows
.venv\Scripts\activate
```

### Lock File

The `uv.lock` file ensures reproducible builds across different environments. It should be committed to version control.

```bash
# Update lock file
uv lock

# Install from lock file (default behavior)
uv sync
```

## Comparison with Traditional Tools

| Task | Traditional | uv |
|------|------------|-----|
| Create venv | `python -m venv venv` | Automatic |
| Activate venv | `source venv/bin/activate` | Not needed with `uv run` |
| Install deps | `pip install -r requirements.txt` | `uv sync` |
| Add package | `pip install package && pip freeze > requirements.txt` | `uv add package` |
| Run script | `python script.py` | `uv run python script.py` |

## Project Structure

```
ai-service/
├── pyproject.toml      # Project configuration and dependencies
├── uv.lock            # Locked dependency versions (commit this!)
├── .venv/             # Virtual environment (auto-created, don't commit)
├── requirements.txt   # Legacy format (for reference)
└── app/               # Application code
```

## Troubleshooting

### "uv: command not found"
Make sure uv is installed and in your PATH. Try:
```bash
which uv
```

If not found, reinstall using one of the installation methods above.

### Python Version Issues
uv respects the `requires-python` field in `pyproject.toml`. This project requires Python 3.9+.

Check your Python version:
```bash
python --version
```

### Dependency Resolution Errors
If you encounter dependency conflicts:
```bash
# Clear cache and retry
uv cache clean
uv sync
```

### Virtual Environment Issues
If the virtual environment is corrupted:
```bash
# Remove and recreate
rm -rf .venv
uv sync
```

## Advanced Usage

### Using Specific Python Version
```bash
# Use a specific Python version
uv venv --python 3.11
```

### Running Commands in the Virtual Environment
```bash
# Run any command with uv run
uv run pytest
uv run black .
uv run ruff check
```

### Exporting Requirements
```bash
# Export to requirements.txt format
uv pip freeze > requirements.txt
```

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Set up Python
  uses: actions/setup-python@v4
  with:
    python-version: '3.9'

- name: Install uv
  run: curl -LsSf https://astral.sh/uv/install.sh | sh

- name: Install dependencies
  run: uv sync

- name: Run tests
  run: uv run python test_service.py
```

## Resources

- [uv Documentation](https://docs.astral.sh/uv/)
- [uv GitHub Repository](https://github.com/astral-sh/uv)
- [Python Packaging Guide](https://packaging.python.org/)

## Why We Chose uv

1. **Speed**: Dramatically faster dependency resolution and installation
2. **Reliability**: Consistent builds across different environments
3. **Modern**: Uses modern Python packaging standards (pyproject.toml)
4. **Developer Experience**: Simpler commands, automatic venv management
5. **Future-proof**: Active development by Astral (creators of Ruff)
