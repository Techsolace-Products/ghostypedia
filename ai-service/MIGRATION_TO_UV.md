# Migration to uv

This document explains the migration from traditional pip/venv to uv for the Ghostypedia AI Service.

## What Changed

### Before (pip/venv)
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app/main.py
```

### After (uv)
```bash
uv sync
uv run python app/main.py
```

## Key Changes

### 1. Project Configuration

**Added `pyproject.toml`:**
- Modern Python project configuration
- Declares dependencies and project metadata
- Replaces setup.py and setup.cfg

**Key sections:**
```toml
[project]
name = "ghostypedia-ai-service"
requires-python = ">=3.9"
dependencies = [
    "google-generativeai>=0.3.2",
    "flask>=3.0.0",
    "requests>=2.31.0",
    "python-dotenv>=1.0.0",
]
```

### 2. Lock File

**Added `uv.lock`:**
- Ensures reproducible builds
- Locks exact versions of all dependencies (including transitive)
- Should be committed to version control
- Automatically updated when dependencies change

### 3. Virtual Environment

**Automatic `.venv` management:**
- Created automatically by `uv sync`
- No need to manually activate when using `uv run`
- Still can be activated manually if needed

### 4. Updated Scripts

**setup.sh:**
- Now checks for uv installation
- Uses `uv sync` instead of pip install
- Provides installation instructions if uv is missing

**New scripts:**
- `verify_setup.py` - Verifies installation and configuration
- `UV_GUIDE.md` - Comprehensive uv usage guide

### 5. Updated Documentation

All documentation updated to use uv commands:
- README.md
- IMPLEMENTATION.md
- Root README.md

## Benefits of Migration

### Speed
- **10-100x faster** dependency resolution
- Parallel downloads and installations
- Efficient caching

### Reliability
- Consistent dependency resolution across environments
- Lock file ensures reproducible builds
- Better conflict detection

### Developer Experience
- Simpler commands (`uv add` vs `pip install && pip freeze`)
- Automatic virtual environment management
- No need to remember to activate venv

### Modern Standards
- Uses pyproject.toml (PEP 621)
- Compatible with modern Python tooling
- Future-proof architecture

## Compatibility

### Backwards Compatibility
- `requirements.txt` still present for reference
- Can still use pip if needed (not recommended)
- All existing code unchanged

### CI/CD
Easy to integrate in CI/CD pipelines:
```yaml
- name: Install uv
  run: curl -LsSf https://astral.sh/uv/install.sh | sh
- name: Install dependencies
  run: uv sync
- name: Run tests
  run: uv run python test_service.py
```

## Migration Checklist

- [x] Created pyproject.toml with project configuration
- [x] Updated Python version requirement to 3.9+ (required by google-generativeai)
- [x] Configured build system (hatchling)
- [x] Updated .gitignore to exclude .venv but include uv.lock
- [x] Updated setup.sh to use uv
- [x] Created verification script
- [x] Updated all documentation
- [x] Created UV_GUIDE.md for detailed usage
- [x] Tested installation and imports
- [x] Generated uv.lock file

## For Developers

### First Time Setup
```bash
# Install uv (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Clone and setup
git clone <repo>
cd ai-service
uv sync

# Verify setup
uv run python verify_setup.py
```

### Daily Workflow
```bash
# Run the service
uv run python app/main.py

# Run tests
uv run python test_service.py

# Add a new dependency
uv add package-name
```

### Updating Dependencies
```bash
# Update all dependencies
uv sync --upgrade

# Update specific package
uv add --upgrade package-name
```

## Troubleshooting

### "uv: command not found"
Install uv using one of the methods in UV_GUIDE.md

### Dependency Conflicts
```bash
uv cache clean
uv sync
```

### Python Version Issues
Ensure Python 3.9+ is installed:
```bash
python --version
```

## Resources

- [uv Documentation](https://docs.astral.sh/uv/)
- [PEP 621 - pyproject.toml](https://peps.python.org/pep-0621/)
- [UV_GUIDE.md](UV_GUIDE.md) - Detailed usage guide

## Questions?

See [UV_GUIDE.md](UV_GUIDE.md) for comprehensive documentation on using uv with this project.
