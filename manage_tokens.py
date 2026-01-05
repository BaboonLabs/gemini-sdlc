import json
import os
import getpass
from pathlib import Path

SETTINGS_PATH = Path.home() / ".gemini" / "settings.json"

def load_settings():
    if not SETTINGS_PATH.exists():
        return {"mcpServers": {}}
    try:
        with open(SETTINGS_PATH, 'r') as f:
            return json.load(f)
    except json.JSONDecodeError:
        return {"mcpServers": {}}

def save_settings(settings):
    SETTINGS_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(SETTINGS_PATH, 'w') as f:
        json.dump(settings, f, indent=2)
    print(f"Updated settings at {SETTINGS_PATH}")

def configure_github(settings):
    print("\nConfiguring GitHub MCP Server...")
    token = getpass.getpass("Enter GitHub Personal Access Token: ")
    
    settings["mcpServers"]["github"] = {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-github"],
        "env": {
            "GITHUB_PERSONAL_ACCESS_TOKEN": token
        }
    }

def configure_jira(settings):
    print("\nConfiguring Jira MCP Server...")
    email = input("Enter Jira Email: ")
    url = input("Enter Jira URL (e.g., https://your-domain.atlassian.net): ")
    token = getpass.getpass("Enter Jira API Token: ")
    
    settings["mcpServers"]["jira"] = {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-jira"],
        "env": {
            "JIRA_API_TOKEN": token,
            "JIRA_URL": url,
            "JIRA_EMAIL": email
        }
    }

def main():
    print("Gemini MCP Token Manager")
    settings = load_settings()
    
    if "mcpServers" not in settings:
        settings["mcpServers"] = {}

    while True:
        print("\n1. Configure GitHub")
        print("2. Configure Jira")
        print("3. Exit")
        choice = input("Select an option: ")
        
        if choice == "1":
            configure_github(settings)
        elif choice == "2":
            configure_jira(settings)
        elif choice == "3":
            save_settings(settings)
            break
        else:
            print("Invalid option")

if __name__ == "__main__":
    main()
