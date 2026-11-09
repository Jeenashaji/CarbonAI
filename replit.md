# CarbonAI - EU Carbon Price Forecasting Platform

## Overview

CarbonAI is a production-ready machine learning application that predicts European Union Emissions Trading System (EU ETS) carbon market prices. The system uses SARIMAX (Seasonal ARIMA with exogenous variables) time series forecasting models trained on real historical EUA (European Union Allowance) price data from Nasdaq Data Link.

The application features a React frontend dashboard for visualizing carbon price trends, historical data, and ML-generated forecasts, backed by an Express.js API server that orchestrates Python ML scripts for data fetching, preprocessing, and model training.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (eco-friendly green palette)
- **Charts**: Recharts for time series visualization
- **Build Tool**: Vite with HMR support

The frontend follows a pages/components architecture with:
- Dashboard page showing current metrics, sync controls, and forecast charts
- Predictions page with detailed forecast tables
- History page displaying historical price data
- Reusable components for metrics cards, charts, and navigation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (compiled with tsx)
- **Database ORM**: Drizzle ORM with PostgreSQL
- **API Design**: RESTful endpoints defined in shared route schemas with Zod validation

Key backend patterns:
- Python scripts spawned as child processes for ML operations
- Storage abstraction layer for database operations
- Shared schema definitions between frontend and backend in `/shared`

### ML Pipeline Architecture
- **Language**: Python 3
- **Data Source**: Nasdaq Data Link EU ETS EUA historical prices (CSV)
- **Primary Model**: SARIMAX with seasonal parameters for monthly patterns
- **Data Flow**: 
  1. `data_fetcher.py` downloads raw EUA prices to `/data/raw/`
  2. `preprocessing.py` generates time series features (lags, rolling stats) to `/data/processed/`
  3. `train.py` trains SARIMAX model, saves to `/models/`, outputs forecasts

### Data Storage
- **Database**: PostgreSQL (provisioned via Replit)
- **Tables**:
  - `carbon_data`: Historical price records (date, price, volume)
  - `predictions`: Model forecasts with confidence intervals

### Project Structure
```
/client          - React frontend application
/server          - Express.js backend API
/shared          - Shared types, schemas, and route definitions
/src             - Python ML scripts
/data            - Raw and processed data files (created at runtime)
/models          - Trained model artifacts (created at runtime)
```

## External Dependencies

### Data Sources
- **Nasdaq Data Link**: Primary source for EU ETS EUA historical carbon prices
  - Endpoint: `https://data.nasdaq.com/api/v3/datasets/EEX/EUA.csv`
  - No API key required for basic CSV access

### Database
- **PostgreSQL**: Required for data persistence
  - Connection via `DATABASE_URL` environment variable
  - Migrations managed with Drizzle Kit (`npm run db:push`)

### Python Dependencies (for ML pipeline)
- pandas - Data manipulation
- numpy - Numerical operations
- statsmodels - SARIMAX implementation
- scikit-learn - Metrics and utilities
- joblib - Model serialization
- requests - HTTP client for data fetching

### Key NPM Packages
- drizzle-orm / drizzle-zod - Database ORM and schema validation
- @tanstack/react-query - Async state management
- recharts - Chart visualization
- date-fns - Date formatting
- zod - Runtime type validation