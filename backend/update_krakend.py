import json

with open('krakend.json', 'r') as f:
    data = json.load(f)

# Find where to insert, let's append to endpoints
new_endpoints = [
    {
        "endpoint": "/api/v1/viewer/upload-intent",
        "method": "POST",
        "output_encoding": "no-op",
        "input_headers": ["*"],
        "input_query_strings": ["*"],
        "backend": [
            {
                "url_pattern": "/api/v1/viewer/upload-intent",
                "encoding": "no-op",
                "sd": "static",
                "method": "POST",
                "host": ["http://viewer-api:8084"]
            }
        ]
    },
    {
        "endpoint": "/api/v1/viewer/process/{job_id}",
        "method": "POST",
        "output_encoding": "no-op",
        "input_headers": ["*"],
        "input_query_strings": ["*"],
        "backend": [
            {
                "url_pattern": "/api/v1/viewer/process/{job_id}",
                "encoding": "no-op",
                "sd": "static",
                "method": "POST",
                "host": ["http://viewer-api:8084"]
            }
        ]
    },
    {
        "endpoint": "/api/v1/viewer/tex/compile",
        "method": "POST",
        "output_encoding": "no-op",
        "input_headers": ["*"],
        "input_query_strings": ["*"],
        "backend": [
            {
                "url_pattern": "/api/v1/viewer/tex/compile",
                "encoding": "no-op",
                "sd": "static",
                "method": "POST",
                "host": ["http://viewer-api:8084"]
            }
        ]
    },
    {
        "endpoint": "/api/v1/viewer/{job_id}/metadata",
        "method": "GET",
        "output_encoding": "no-op",
        "input_headers": ["*"],
        "input_query_strings": ["*"],
        "backend": [
            {
                "url_pattern": "/api/v1/viewer/{job_id}/metadata",
                "encoding": "no-op",
                "sd": "static",
                "method": "GET",
                "host": ["http://viewer-api:8084"]
            }
        ]
    },
    {
        "endpoint": "/api/v1/viewer/download/{job_id}",
        "method": "GET",
        "output_encoding": "no-op",
        "input_headers": ["*"],
        "input_query_strings": ["*"],
        "backend": [
            {
                "url_pattern": "/api/v1/viewer/download/{job_id}",
                "encoding": "no-op",
                "sd": "static",
                "method": "GET",
                "host": ["http://viewer-api:8084"]
            }
        ]
    }
]

# Remove the old /api/v1/viewer/{path} endpoint
data['endpoints'] = [e for e in data['endpoints'] if e.get('endpoint') != '/api/v1/viewer/{path}']

# Append the new endpoints
data['endpoints'].extend(new_endpoints)

with open('krakend.json', 'w') as f:
    json.dump(data, f, indent=4)

print("Updated krakend.json successfully.")
