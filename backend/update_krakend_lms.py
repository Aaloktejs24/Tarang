import json

with open('krakend.json', 'r') as f:
    data = json.load(f)

new_endpoints = [
    {
        "endpoint": "/api/v1/lms/courses",
        "method": "POST",
        "output_encoding": "no-op",
        "input_headers": ["Authorization", "Content-Type"],
        "backend": [
            {
                "url_pattern": "/api/v1/lms/courses",
                "encoding": "no-op",
                "sd": "static",
                "method": "POST",
                "host": ["http://lms-service:8085"]
            }
        ]
    },
    {
        "endpoint": "/api/v1/lms/courses",
        "method": "GET",
        "output_encoding": "no-op",
        "input_headers": ["Authorization"],
        "backend": [
            {
                "url_pattern": "/api/v1/lms/courses",
                "encoding": "no-op",
                "sd": "static",
                "method": "GET",
                "host": ["http://lms-service:8085"]
            }
        ]
    },
    {
        "endpoint": "/api/v1/lms/courses/{id}",
        "method": "GET",
        "output_encoding": "no-op",
        "input_headers": ["Authorization"],
        "backend": [
            {
                "url_pattern": "/api/v1/lms/courses/{id}",
                "encoding": "no-op",
                "sd": "static",
                "method": "GET",
                "host": ["http://lms-service:8085"]
            }
        ]
    },
    {
        "endpoint": "/api/v1/lms/courses/{id}",
        "method": "PUT",
        "output_encoding": "no-op",
        "input_headers": ["Authorization", "Content-Type"],
        "backend": [
            {
                "url_pattern": "/api/v1/lms/courses/{id}",
                "encoding": "no-op",
                "sd": "static",
                "method": "PUT",
                "host": ["http://lms-service:8085"]
            }
        ]
    },
    {
        "endpoint": "/api/v1/lms/courses/{id}",
        "method": "DELETE",
        "output_encoding": "no-op",
        "input_headers": ["Authorization"],
        "backend": [
            {
                "url_pattern": "/api/v1/lms/courses/{id}",
                "encoding": "no-op",
                "sd": "static",
                "method": "DELETE",
                "host": ["http://lms-service:8085"]
            }
        ]
    }
]

data['endpoints'].extend(new_endpoints)

with open('krakend.json', 'w') as f:
    json.dump(data, f, indent=4)

