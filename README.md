# BotForge Dataset AI Platform

A comprehensive AI-powered platform for dataset analysis, featuring conversational AI, vector search, and interactive data visualization.

## 🌟 Features

### 1. Dataset Upload & Management
- **Drag & Drop Upload**: Upload CSV or JSON files directly
- **Datacard Display**: Rich dataset information cards with metadata
- **Multiple Format Support**: CSV, JSON file formats
- **Auto-Processing**: Automatic data type detection and preprocessing

### 2. Conversational AI Chat Interface
- **Gemini AI Integration**: Powered by Google's Gemini Pro model
- **Vector Search**: MongoDB Atlas vector search for semantic data retrieval
- **Natural Language Queries**: Ask questions in plain English
- **Context-Aware Responses**: AI responses based on actual dataset content
- **Real-time Chat**: Instant responses with typing indicators

### 3. Advanced Analytics Dashboard
- **Interactive Charts**: Bar, Line, Pie, and Doughnut charts
- **Statistical Analysis**: Data type analysis, missing values, correlations
- **Visual Insights**: Distribution analysis and trend visualization
- **Export Functionality**: Download analysis reports in JSON format
- **Real-time Updates**: Refresh data and regenerate insights

### 4. MongoDB Vector Search
- **Semantic Search**: Find relevant data using natural language
- **Vector Embeddings**: Generated using Google's embedding models
- **Scalable Storage**: MongoDB Atlas cluster for production use
- **Efficient Indexing**: Optimized vector indexes for fast retrieval

## 🏗️ Architecture

```
Frontend (React + TypeScript)
├── Dataset Grid (Upload & Selection)
├── Chat Interface (Gemini AI)
├── Analysis Dashboard (Charts & Stats)
└── Vector Search Demo

Backend (Python Flask)
├── Dataset Processing
├── MongoDB Integration
├── Gemini AI API
├── Vector Search Engine
└── Analysis Engine

Database (MongoDB Atlas)
├── Dataset Collections
├── Vector Embeddings
├── Metadata Storage
└── Search Indexes
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- MongoDB Atlas account
- Google AI Studio API key

### 1. Environment Setup

Create a `.env` file in the `backend/` directory:

```env
GOOGLE_PROJECT_ID=your_google_project_id
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
MONGODB_DATABASE=botforge
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
python start_backend.py
```

The backend will start on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

## 📊 Supported Datasets

### Pre-loaded Datasets
1. **Olympics Data** - Summer Olympics medal counts by country
2. **GDELT** - Global Database of Events, Language, and Tone
3. **UN SDG** - United Nations Sustainable Development Goals data

### Custom Datasets
- Upload your own CSV or JSON files
- Automatic schema detection
- Vector embedding generation
- Instant search and analysis

## 🛠️ API Endpoints

### Dataset Management
- `POST /load/olympics` - Load Olympics dataset
- `POST /load/gdelt` - Load GDELT dataset  
- `POST /load/unsdg` - Load UN SDG dataset
- `POST /load/custom` - Upload custom dataset

### AI & Search
- `POST /query` - Query dataset with natural language
- `POST /analyze` - Get dataset analysis and statistics

### Infrastructure
- `POST /create-index/<dataset>` - Create vector search index

## 💡 Usage Examples

### Chat Interface
```
User: "Which countries won the most gold medals?"
AI: "Based on the Olympics dataset, the United States leads with 1,062 gold medals, followed by the Soviet Union with 496 gold medals..."
```

### Analysis Dashboard
- View dataset statistics and summaries
- Interactive charts showing data distributions
- Export analysis reports for further use

## 🔧 Advanced Configuration

### MongoDB Vector Search Setup
1. Create a MongoDB Atlas cluster
2. Set up vector search indexes
3. Configure connection in `.env` file

### Gemini AI Configuration
1. Get API key from Google AI Studio
2. Set up project in Google Cloud Console
3. Configure API key in `.env` file

### Custom Dataset Schema
```json
{
  "id": "unique_id",
  "name": "Dataset Name",
  "description": "Dataset description",
  "recordCount": 1000,
  "dataRows": [...],
  "vectors": [...]
}
```

## 🧪 Development

### Adding New Dataset Sources
1. Create loader function in `backend/load_dataset_to_mongo.py`
2. Add route handler for new dataset
3. Update frontend dataset list

### Custom Analysis Algorithms
1. Extend `analyze_documents()` function
2. Add new chart types in `AnalysisDashboard.tsx`
3. Update API endpoints

## 🔍 Troubleshooting

### Common Issues

**Backend Connection Failed**
- Check if MongoDB URI is correct
- Verify Gemini API key is valid
- Ensure all dependencies are installed

**Vector Search Not Working**
- Create vector search indexes in MongoDB
- Check if embeddings are generated
- Verify index names match dataset names

**Frontend Build Errors**
- Run `npm install` to update dependencies
- Check Node.js version compatibility
- Clear npm cache if needed

## 📈 Performance Optimization

### Vector Search
- Use appropriate vector dimensions (768 for Gemini embeddings)
- Optimize index configurations
- Batch embedding generation

### Database
- Use MongoDB Atlas for production
- Set up proper indexing
- Monitor query performance

### Frontend
- Implement lazy loading for large datasets
- Use React.memo for expensive components
- Optimize chart rendering

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google AI for Gemini API
- MongoDB for vector search capabilities
- React and TypeScript communities
- Chart.js for visualization components

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation
3. Open an issue on GitHub
4. Contact the development team

---

**Built with ❤️ using React, TypeScript, Python, MongoDB, and Google AI**#   b o t - f o r g e  
 #   b o t - f o r g e - 1  
 #   b o t - f o r g e - 1  
 