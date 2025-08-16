# Makefile for the EventFlow Application

# Use .PHONY to declare targets that are not associated with a file.
# This prevents 'make' from getting confused if a file with the same name exists.
.PHONY: install run stop

# Install all dependencies for both the frontend and backend services.
# This is a great first step when setting up the project.
install:
	@echo "--- Installing backend dependencies (Poetry) ---"
	cd backend && poetry install
	@echo "\n--- Installing frontend dependencies (NPM) ---"
	cd frontend && npm install
	@echo "\n--- Installation complete! ---"

# Run the full application (backend and frontend concurrently).
# This single command will start both servers.
run:
	@echo "--- Starting EventFlow application ---"
	@echo "Backend will run on http://localhost:8000"
	@echo "Frontend will run on http://localhost:3000"
	@echo "Press Ctrl+C to stop both services."
	@# The 'trap' command ensures that when you press Ctrl+C,
	@# it sends a kill signal to all child processes (both servers).
	@trap 'echo "\n--- Shutting down... ---"; kill 0' EXIT; \
	(cd backend && poetry run uvicorn event_planner_backend.main:app --reload) & \
	(cd frontend && npm start)

# A utility command to forcefully stop any processes running on the app's ports.
# Useful if a server doesn't shut down correctly.
stop:
	@echo "--- Attempting to stop any running services on ports 3000 and 8000 ---"
	@# This command finds the process ID (PID) on a port and kills it.
	@# The '|| true' prevents an error if no process is found.
	@lsof -t -i:8000 | xargs kill -9 || true
	@lsof -t -i:3000 | xargs kill -9 || true
	@echo "--- Stop command executed. ---"
