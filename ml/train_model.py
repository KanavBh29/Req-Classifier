"""
Training script for requirement classification model.
Run: python train_model.py
"""
import joblib
import os
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# Training dataset
TRAINING_DATA = [
    # Functional Requirements (FR)
    ("The system shall allow users to login with email and password", "FR"),
    ("The system shall send email notifications to users", "FR"),
    ("The system shall allow administrators to manage user accounts", "FR"),
    ("The system shall provide a dashboard to display analytics", "FR"),
    ("The system shall allow users to upload files up to 50MB", "FR"),
    ("The system shall generate PDF reports on demand", "FR"),
    ("The system shall support search and filtering of records", "FR"),
    ("The system shall validate input fields before submission", "FR"),
    ("The system shall allow users to export data in CSV format", "FR"),
    ("The system shall provide role-based access control", "FR"),
    ("Users shall be able to create, read, update, and delete requirements", "FR"),
    ("The system shall classify requirements using machine learning", "FR"),
    ("The application shall support drag and drop file upload", "FR"),
    ("The system shall display a traceability matrix for requirements", "FR"),
    ("Users shall receive real-time notifications for updates", "FR"),
    ("The system shall allow linking requirements to test cases", "FR"),
    ("The system shall parse PDF documents to extract requirements", "FR"),
    ("The system shall support two-factor authentication", "FR"),
    ("The system shall log all user activities for audit", "FR"),
    ("The system shall allow batch import of requirements", "FR"),
    ("The application shall provide a REST API for integration", "FR"),
    ("Users shall be able to comment on requirements", "FR"),
    ("The system shall generate unique IDs for each requirement", "FR"),
    ("The system shall support version history of requirements", "FR"),
    ("The system shall allow tagging and categorization of requirements", "FR"),
    ("The system shall provide a calendar view for project deadlines", "FR"),
    ("Users shall be able to assign requirements to team members", "FR"),
    ("The system shall send weekly summary reports via email", "FR"),
    ("The application shall support import from Jira and Confluence", "FR"),
    ("The system shall allow users to reset their password", "FR"),
    # Non-Functional Requirements (NFR)
    ("The system shall respond to all requests within 500 milliseconds", "NFR"),
    ("The system shall be available 99.9% of the time", "NFR"),
    ("The application shall support 10,000 concurrent users", "NFR"),
    ("The system shall encrypt all data at rest using AES-256", "NFR"),
    ("The application shall comply with GDPR regulations", "NFR"),
    ("The system shall maintain performance under peak load conditions", "NFR"),
    ("The database shall support horizontal scaling", "NFR"),
    ("The system shall recover from failures within 30 seconds", "NFR"),
    ("The application shall be compatible with all major browsers", "NFR"),
    ("The system shall use SSL/TLS for all data transmission", "NFR"),
    ("The codebase shall maintain 80% test coverage", "NFR"),
    ("The system shall process ML inference within 100ms", "NFR"),
    ("The application shall be mobile-responsive", "NFR"),
    ("The system shall achieve 95% uptime SLA", "NFR"),
    ("The application shall support internationalization", "NFR"),
    ("The system shall scale to handle 1 million records", "NFR"),
    ("All API endpoints shall be rate limited to prevent abuse", "NFR"),
    ("The system shall perform automated backups every 24 hours", "NFR"),
    ("The application shall comply with WCAG 2.1 accessibility standards", "NFR"),
    ("The system shall use microservices architecture for scalability", "NFR"),
    ("Response time shall not exceed 2 seconds for complex queries", "NFR"),
    ("The system shall maintain data integrity under concurrent access", "NFR"),
    ("Security audits shall be conducted quarterly", "NFR"),
    ("The system shall support zero-downtime deployments", "NFR"),
    ("All passwords shall be hashed using bcrypt with salt rounds of 12", "NFR"),
    ("The system shall support multi-region deployment for low latency", "NFR"),
    ("API response payload shall not exceed 1MB", "NFR"),
    ("The system shall implement circuit breaker pattern for resilience", "NFR"),
    ("Database queries shall be optimized for under 50ms execution", "NFR"),
    ("The system shall maintain audit logs for 7 years", "NFR"),
]

def train():
    texts, labels = zip(*TRAINING_DATA)
    X_train, X_test, y_train, y_test = train_test_split(texts, labels, test_size=0.2, random_state=42, stratify=labels)

    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            ngram_range=(1, 3),
            max_features=5000,
            min_df=1,
            stop_words='english',
            sublinear_tf=True
        )),
        ('clf', LogisticRegression(
            C=1.0,
            max_iter=1000,
            class_weight='balanced',
            random_state=42
        ))
    ])

    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)

    print("=== Classification Report ===")
    print(classification_report(y_test, y_pred))

    os.makedirs('model', exist_ok=True)
    joblib.dump(pipeline, 'model/classifier.pkl')
    print("✅ Model saved to model/classifier.pkl")

    return pipeline

if __name__ == '__main__':
    train()
