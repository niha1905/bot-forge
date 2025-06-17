#!/usr/bin/env python3
"""
BotForge Backend Startup Script
This script initializes and starts the backend server with MongoDB vector search and Gemini AI.
"""

import os
import sys
from load_dataset_to_mongo import app

def check_environment():
    """Check if all required environment variables are set"""
    required_vars = [
        'GOOGLE_PROJECT_ID',
        'GEMINI_API_KEY', 
        'MONGODB_URI',
        'MONGODB_DATABASE'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\nPlease check your .env file and make sure all variables are set.")
        return False
    
    print("✅ All environment variables are set")
    return True

def main():
    print("🚀 Starting BotForge Backend Server...")
    print("=" * 50)
    
    # Check environment
    if not check_environment():
        sys.exit(1)
    
    print("📊 Features enabled:")
    print("   - Dataset upload and processing")
    print("   - MongoDB vector search")
    print("   - Gemini AI chat interface")
    print("   - Data analysis and visualization")
    print("   - Olympic, GDELT, and UN SDG datasets")
    
    print("\n🌐 Server starting on http://localhost:5000")
    print("   - CORS enabled for frontend integration")
    print("   - Debug mode: ON")
    
    print("\n📋 Available endpoints:")
    print("   POST /load/<dataset>     - Load predefined datasets")
    print("   POST /load/custom        - Upload custom CSV files")
    print("   POST /query             - Query datasets with AI")
    print("   POST /analyze           - Analyze dataset statistics")
    print("   POST /create-index/<dataset> - Create vector indexes")
    
    print("\n" + "=" * 50)
    
    # Start the Flask app
    app.run(host='0.0.0.0', port=5000, debug=True)

if __name__ == "__main__":
    main()