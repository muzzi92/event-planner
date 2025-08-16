# Event Planner App

Welcome to the EventFlow Planner! This is a comprehensive tool designed to help you manage event details, from budgets and invoices to important documents.

## Getting Started

This guide will walk you through setting up and running the EventFlow Planner application on your computer.

### Step 1: Install the Tools

Before you can run the project, you need to make sure you have three key tools installed. If you already have them, you can skip to Step 2.

#### A. Make (A command-line helper)

make is a simple tool that lets us run complex commands with a single, short command.

* On macOS: The easiest way is to install Apple's Command Line Tools. Open your Terminal app and run this command: `xcode-select --install`. Follow the on-screen prompts to complete the installation.
* On Windows/Linux: You can find instructions for installing make for your specific operating system online.

#### B. npm (For the user interface)

npm is the package manager for JavaScript and is included when you install Node.js.

* Go to the official Node.js website.
* Download the installer for the LTS (Long-Term Support) version.
* Run the installer to set up both Node.js and npm.

#### C. Poetry (For the backend server)

Poetry is a tool we use to manage the code libraries for our backend server.

* Open your terminal and run the official installation command: `curl -sSL https://install.python-poetry.org | python3 -`
* After the installation is complete, it's a good idea to close and reopen your terminal window.

### Step 2: Install the Project Dependencies

Now that the tools are ready, you can install all the project-specific code with one simple command.

Navigate to the project's root directory in your terminal and run: `make install`

This command will automatically find and install all the required dependencies for both the frontend user interface and the backend server.

### Step 3: Run the Application

You're all set! To start the entire application, run this command from the project's root directory: `make run`

This will start both servers at the same time. You will see some text in your terminal indicating that they are running.

* The Frontend Application is now available at: http://localhost:3000
* The Backend API is running at: http://localhost:8000

Open http://localhost:3000 in your web browser to see and use the EventFlow Planner.

To stop the application, simply go back to the terminal window where it is running and press the Ctrl + C keys.