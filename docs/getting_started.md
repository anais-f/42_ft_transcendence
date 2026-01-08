### Prerequisites

Ensure you have the required environment variables configured:

```bash
# Install all necessary dependencies (for dev/test only)
make install
```

```bash
# Verify environment setup
make verif-env
```

### Build the application

```bash
# Build all services
make build
```

### Start the application

```bash
# Start all services in detached mode
make up
```

### Development mode

For development with hot-reload:

```bash
# Build development environment
make dev-build

# Start in development mode
make dev-up
```

### Stop the application

```bash
# Stop all services
make down
```

## Useful Commands

### View logs from specific services

```bash
# View service logs
make "logs-${service_name}"
```

### Access service shell

```bash
# Access service shell
make "sh-${service_name}"
```

### Code formatting

```bash
# Format code
make format

# Check formatting
make format-check
```

### Run tests

```bash
# Run all tests
make test
```

### Debug mode

Run services with logs visible in the console:

```bash
# Start in debug mode with console logs
make debug
```

### Reset all databases

**Warning**: This will delete all data in volumes.

```bash
# Stop services and remove all volumes
make reset-db
```

### Before committing

```bash
# Check code formatting
make format

# Run tests
make test
```
