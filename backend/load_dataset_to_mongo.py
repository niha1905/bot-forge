# load_dataset_to_mongo.py
import os
import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
# --- Flask App ---
app = Flask(__name__)
CORS(app)
# --- Load env variables ---
load_dotenv()

PROJECT_ID = os.getenv("GOOGLE_PROJECT_ID")
MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("MONGODB_DATABASE")

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# --- Init Mongo ---
client = MongoClient(MONGODB_URI)
db = client[DB_NAME]

# --- Load Sample Datasets ---
def load_olympics():
    url = "https://raw.githubusercontent.com/rfordatascience/tidytuesday/master/data/2021/2021-07-27/olympics.csv"
    df = pd.read_csv(url)
    df = df[df["season"] == "Summer"]
    df = df.groupby("noc")["medal"].value_counts().unstack(fill_value=0).reset_index()
    df.columns.name = None
    df.columns = ["Country", "Bronze", "Gold", "Silver"]
    df["text"] = df.apply(lambda row:
        f"{row['Country']} won {row['Gold']} Gold, {row['Silver']} Silver, {row['Bronze']} Bronze medals.",
        axis=1
    )
    return df[["Country", "text"]], "olympics"

def load_gdelt():
    url = "https://raw.githubusercontent.com/mediagis/nlp-datasets/main/gdelt_sample.csv"
    df = pd.read_csv(url)
    df = df[["SQLDATE", "Actor1Name", "Actor2Name", "EventCode", "EventBaseCode", "EventRootCode"]].dropna()
    df["text"] = df.apply(lambda row: f"On {row['SQLDATE']}, event {row['EventCode']} occurred between {row['Actor1Name']} and {row['Actor2Name']}.", axis=1)
    return df[["text"]], "gdelt"

def load_unsdg():
    url = "https://raw.githubusercontent.com/datasets/sdg/master/data/sdg.csv"
    df = pd.read_csv(url)
    df = df[["Goal", "Indicator", "Country", "Value"]].dropna()
    df["text"] = df.apply(lambda row: f"Goal {row['Goal']} - {row['Indicator']} in {row['Country']} has value {row['Value']}.", axis=1)
    return df[["text"]], "unsdg"

# --- Generate Embedding ---
def generate_embedding(text):
    response = genai.embed_content(
        model="models/embedding-001",
        content=text,
        task_type="retrieval_document"
    )
    return response["embedding"]

# --- Insert to MongoDB ---
def insert_to_mongodb(df, collection_name):
    collection = db[collection_name]
    records = []
    for _, row in df.iterrows():
        try:
            emb = generate_embedding(row["text"])
            records.append({
                "text": row["text"],
                "embedding": emb
            })
        except Exception as e:
            print(f"Failed: {e}")
    if records:
        collection.insert_many(records)
        print(f"Inserted {len(records)} records into {collection_name}.")
@app.route("/create-index/<dataset>", methods=["POST"])
def create_index(dataset):
    from pymongo.operations import IndexModel

    collection = db[dataset]
    vector_index = {
        "name": f"{dataset}_vector_index",
        "definition": {
            "mappings": {
                "dynamic": True,
                "fields": {
                    "embedding": {
                        "type": "knnVector",
                        "dimensions": 768,  # or 768 for Vertex embeddings
                        "similarity": "cosine"
                    }
                }
            }
        }
    }
    try:
        collection.create_index(
            [("embedding", "knnVector")],
            name=vector_index["name"]
        )
        return jsonify({"message": f"Vector index {vector_index['name']} created."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- MongoDB Vector Search ---
def query_mongodb(query, dataset="olympics", top_k=5):
    # Convert the user question to a search query using Gemini
    search_query = convert_question_to_search_query(query)
    emb = generate_embedding(search_query)
    collection = db[dataset]
    index_name = f"{dataset}_vector_index"
    try:
        results = collection.aggregate([
            {
                "$vectorSearch": {
                    "index": index_name,
                    "path": "embedding",
                    "queryVector": emb,
                    "numCandidates": 100,
                    "limit": top_k
                }
            }
        ])
        return list(results)
    except Exception as e:
        print(f"Vector search error: {e}")
        print(f"Tried index: {index_name}, query embedding shape: {len(emb) if hasattr(emb, '__len__') else type(emb)}")
        import traceback
        traceback.print_exc()
        return []
GEMINI_MODEL = "models/gemini-1.5"  # Use the correct model name for Gemini Flash
def convert_question_to_search_query(question):
    """Use Gemini to convert a user question into a concise search query for vector search."""
    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
        prompt = f"""
        Convert the following user question into a concise search query or keywords suitable for semantic vector search in a dataset. Remove unnecessary words and focus on the main topic or entities.

        User question: {question}

        Output only the search query, nothing else.
        """
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Failed to convert question to search query: {e}")
        return question

def generate_ai_response(query, context):
    """Generate a formal AI answer using Gemini, tailored for vector search context"""
    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
        prompt = f"""
        You are an expert data analyst. Given the following context retrieved from a vector search in a dataset, answer the user's question in a formal, well-structured manner suitable for a professional report.

        Context from vector search:
        {context}

        User question:
        {query}

        Instructions:
        - Use only the information in the context to answer the question.
        - If the context is insufficient, state this clearly and suggest what additional data would be needed.
        - Format your answer formally, using complete sentences and clear structure.
        - Avoid speculation or informal language.
        """
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"AI response generation failed: {e}")
        return f"Based on the dataset, here are the relevant findings: {context[:200]}..."

@app.route("/load/<dataset>", methods=["POST"])
def load(dataset):
    if dataset == "olympics":
        df, name = load_olympics()
    elif dataset == "gdelt":
        df, name = load_gdelt()
    elif dataset == "unsdg":
        df, name = load_unsdg()
    else:
        return jsonify({"error": "Unknown dataset"}), 400
    insert_to_mongodb(df, name)
    return jsonify({"message": f"{name} dataset loaded and inserted"})

@app.route("/analyze", methods=["POST"])
def analyze_dataset():
    """Analyze dataset and return statistics"""
    data = request.json
    dataset_name = data.get("dataset", "olympics")
    
    try:
        collection = db[dataset_name]
        
        # Get total count
        total_records = collection.count_documents({})
        
        if total_records == 0:
            return jsonify({"error": "Dataset not found or empty"}), 404
        
        # Get sample documents for analysis
        sample_docs = list(collection.find().limit(1000))
        
        # Analyze the data
        analysis = analyze_documents(sample_docs)
        analysis["summary"]["totalRecords"] = total_records
        
        return jsonify(analysis)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def analyze_documents(docs):
    """Analyze a collection of documents"""
    if not docs:
        return {
            "summary": {"totalRecords": 0, "uniqueValues": 0, "missingValues": 0, "dataTypes": {}},
            "trends": {"labels": [], "values": []},
            "distribution": {"labels": [], "values": []},
            "correlations": []
        }
    
    # Get all unique fields
    all_fields = set()
    for doc in docs:
        all_fields.update(doc.keys())
    
    all_fields.discard('_id')  # Remove MongoDB _id field
    all_fields.discard('embedding')  # Remove embedding field
    
    # Analyze each field
    field_analysis = {}
    total_missing = 0
    
    for field in all_fields:
        values = []
        for doc in docs:
            value = doc.get(field)
            if value is not None and value != '':
                values.append(value)
            else:
                total_missing += 1
        
        if values:
            field_analysis[field] = {
                'values': values,
                'unique_count': len(set(values)),
                'total_count': len(values),
                'missing_count': len(docs) - len(values)
            }
    
    # Generate trend data (use text field for word count trends)
    text_field = None
    for field, analysis in field_analysis.items():
        if field == 'text' or any(isinstance(v, str) and len(v) > 20 for v in analysis['values'][:5]):
            text_field = field
            break
    
    trend_data = {"labels": [], "values": []}
    if text_field and len(field_analysis[text_field]['values']) >= 10:
        # Create trend based on text length or word count
        values = field_analysis[text_field]['values'][:10]
        trend_data = {
            "labels": [f"Record {i+1}" for i in range(len(values))],
            "values": [len(str(v).split()) for v in values]
        }
    
    # Generate distribution data
    distribution_data = {"labels": [], "values": []}
    
    # Find a good categorical field for distribution
    categorical_field = None
    for field, analysis in field_analysis.items():
        if (analysis['unique_count'] < analysis['total_count'] * 0.5 and 
            analysis['unique_count'] > 1 and 
            analysis['unique_count'] <= 20):
            categorical_field = field
            break
    
    if categorical_field:
        values = field_analysis[categorical_field]['values']
        from collections import Counter
        counter = Counter(str(v) for v in values)
        most_common = counter.most_common(8)
        distribution_data = {
            "labels": [item[0] for item in most_common],
            "values": [item[1] for item in most_common]
        }
    else:
        # Default distribution if no good categorical field
        distribution_data = {
            "labels": ["Text Records", "Numeric Records", "Mixed Records"],
            "values": [len(docs) // 3, len(docs) // 3, len(docs) - 2 * (len(docs) // 3)]
        }
    
    # Calculate data types
    data_types = {}
    for field, analysis in field_analysis.items():
        # Check if field is mostly numeric
        numeric_count = 0
        for value in analysis['values']:
            try:
                float(str(value))
                numeric_count += 1
            except (ValueError, TypeError):
                pass
        
        if numeric_count > len(analysis['values']) * 0.8:
            data_types[field] = numeric_count
    
    return {
        "summary": {
            "totalRecords": len(docs),
            "uniqueValues": sum(analysis['unique_count'] for analysis in field_analysis.values()),
            "missingValues": total_missing,
            "dataTypes": data_types
        },
        "trends": trend_data,
        "distribution": distribution_data,
        "correlations": []  # Could implement correlation analysis here
    }

@app.route("/datasets", methods=["GET"])
def list_datasets():
    """Return a list of available datasets (collections) in the database."""
    collections = db.list_collection_names()
    dataset_list = []
    for name in collections:
        count = db[name].count_documents({})
        dataset_list.append({
            "id": name,
            "name": name.capitalize(),
            "description": f"Dataset for {name}",
            "recordCount": count,
            "lastUpdated": "2025-06-17",
            "tags": [],
            "icon": "📊",
            "color": "#8884d8",
            "source": "",
        })
    return jsonify(dataset_list)

@app.route("/query", methods=["POST"])
def query():
    data = request.json
    query = data.get("query")
    dataset = data.get("dataset", "olympics")
    if not query:
        return jsonify({"error": "No query provided"}), 400

    # Get vector search results
    vector_results = query_mongodb(query, dataset)

    # Generate AI response using Gemini
    if vector_results:
        context = "\n".join([result.get("text", "") for result in vector_results[:3]])
        ai_response = generate_ai_response(query, context)
        return jsonify({
            "ai_response": ai_response,
            "vector_results": vector_results,
            "context_used": context
        })
    else:
        return jsonify({
            "ai_response": "I couldn't find relevant information in the dataset for your query.",
            "vector_results": [],
            "context_used": ""
        })
# --- Run server ---
if __name__ == "__main__":
    app.run(debug=True, port=5000)