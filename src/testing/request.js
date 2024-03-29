export const request = {
        "master_job_mode": "MULTITHREADED",
        "worker_job_mode": "MULTITHREADED",
        "model_framework": "SCIKIT_LEARN",
        "model_category": "CLASSIFICATION",
        "mongo_host": "localhost",
        "mongo_port": 27017,
        "read_config": {
        "read_preference": "primary",
            "read_concern": "local"
    },
        "database": "sustaindb",
        "collection": "noaa_nam",
        "feature_fields": [
        "PRESSURE_REDUCED_TO_MSL_PASCAL",
        "VISIBILITY_AT_SURFACE_METERS",
        "VISIBILITY_AT_CLOUD_TOP_METERS",
        "WIND_GUST_SPEED_AT_SURFACE_METERS_PER_SEC",
        "PRESSURE_AT_SURFACE_PASCAL"
    ],
        "label_field": "CATEGORICAL_SNOW_SURFACE_BINARY",
        "normalize_inputs": true,
        "validation_budget": {
        "budget_type": "STATIC_BUDGET",
            "static_budget": {
            "total_limit": 0,
                "strata_limit": 0,
                "sample_rate": 0.2
        }
    },
        "loss_function": "MEAN_SQUARED_ERROR",
        "spatial_coverage": "ALL"
}
