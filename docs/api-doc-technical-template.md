# [TEMPLATE] API Documentation - [Service/Feature Name]

## Overview
Brief description of what this API service does and its primary purpose.

## Environments

| Environment | Base URL | Purpose |
|------------|----------|---------|
| Development | https://dev-api.example.com | Development and testing |
| Production | https://api.example.com | Live production environment |

## Authentication

**Type:** [Bearer Token / API Key]

**Header:** `Authorization: Bearer {token}`

**How to obtain credentials:** [Instructions for getting access tokens or API keys]

## Common Headers

| Header | Required | Description | Example |
|--------|----------|-------------|---------|
| Content-Type | Yes | Request content type | application/json |
| Authorization | Yes | Authentication token | Bearer eyJhbGc... |
| Accept | No | Response content type | application/json |

## Error Handling

### Standard Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional context about the error",
    "timestamp": "2025-12-17T10:30:00Z",
    "request_id": "550e8400-e29b-41d4-a716"
  }
}
```

### Common Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | INVALID_REQUEST | Request validation failed |
| 401 | UNAUTHORIZED | Missing or invalid authentication |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests |
| 500 | INTERNAL_ERROR | Server error |
| 503 | SERVICE_UNAVAILABLE | Service temporarily unavailable |

## API Endpoints

### [Endpoint Name]

#### Endpoint Details

**Method:** GET / POST / PUT / PATCH / DELETE

**Path:** `/api/v1/resource/{id}`

**Description:** Brief description of what this endpoint does and when to use it.

**Authentication Required:** Yes / No

**Rate Limited:** Yes / No

#### Request

##### Path Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| id | string | Yes | Unique identifier for the resource | usr_12345 |

##### Query Parameters

| Parameter | Type | Required | Description | Default | Example |
|-----------|------|----------|-------------|---------|---------|
| limit | integer | No | Number of results to return | 20 | 50 |
| offset | integer | No | Number of results to skip | 0 | 100 |
| sort | string | No | Sort field and direction | created_at:desc | name:asc |
| filter | string | No | Filter criteria | - | status:active |

##### Request Headers

| Header | Required | Description | Example |
|--------|----------|-------------|---------|
| Content-Type | Yes | Must be application/json | application/json |
| Authorization | Yes | Bearer token | Bearer eyJhbGc... |

##### Request Body

```json
{
  "field1": "string",
  "field2": 123,
  "field3": true,
  "nested_object": {
    "sub_field1": "value",
    "sub_field2": ["array", "values"]
  }
}
```

**Field Descriptions:**

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| field1 | string | Yes | Description of field1 | Max 255 characters |
| field2 | integer | No | Description of field2 | Min: 1, Max: 1000 |
| field3 | boolean | No | Description of field3 | - |
| nested_object.sub_field1 | string | Yes | Description of sub_field1 | Must match pattern: ^[A-Z] |
| nested_object.sub_field2 | array | No | Description of sub_field2 | Max 10 items |

#### Response

##### Success Response

**Status Code:** 200 OK / 201 Created / 204 No Content

**Response Headers:**

| Header | Description | Example |
|--------|-------------|---------|
| Content-Type | Response content type | application/json |
| X-Request-ID | Request identifier | 550e8400-e29b-41d4-a716 |
| ETag | Resource version | "33a64df551425fcc55e4d42a148795d9f25f89d4" |

**Response Body:**

```json
{
  "data": {
    "id": "usr_12345",
    "field1": "string",
    "field2": 123,
    "created_at": "2025-12-17T10:30:00Z",
    "updated_at": "2025-12-17T10:30:00Z"
  },
  "metadata": {
    "request_id": "550e8400-e29b-41d4-a716",
    "timestamp": "2025-12-17T10:30:00Z"
  }
}
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| data.id | string | Unique identifier |
| data.field1 | string | Description of field1 |
| data.field2 | integer | Description of field2 |
| data.created_at | string (ISO 8601) | Creation timestamp |
| data.updated_at | string (ISO 8601) | Last update timestamp |

##### Error Responses

**Status Code:** 400 Bad Request

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Validation failed",
    "details": "field1 is required",
    "timestamp": "2025-12-17T10:30:00Z",
    "request_id": "550e8400-e29b-41d4-a716"
  }
}
```

**Status Code:** 404 Not Found

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found",
    "details": "No resource found with id: usr_12345",
    "timestamp": "2025-12-17T10:30:00Z",
    "request_id": "550e8400-e29b-41d4-a716"
  }
}
```

#### Example Requests

##### cURL

```bash
curl -X POST https://api.example.com/api/v1/resource \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "field1": "example value",
    "field2": 123,
    "field3": true
  }'
```

#### Notes & Best Practices

- Important considerations when using this endpoint
- Performance tips or optimization suggestions
- Common pitfalls to avoid
- Related endpoints or workflows
- Add reference to other docs if applicable

## Appendix

### Data Types & Formats

#### Date/Time Format
All timestamps follow ISO 8601 format: `YYYY-MM-DDTHH:mm:ssZ`

#### Pagination
Standard pagination follows the offset/limit pattern:
- `limit`: Number of items per page (default: 20, max: 100)
- `offset`: Number of items to skip (default: 0)

#### Filtering
Filters use the format: `field:value` or `field:operator:value`

Supported operators:
- `eq` - equals
- `ne` - not equals
- `gt` - greater than
- `lt` - less than
- `contains` - contains substring

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2025-12-17 | Mahim Safa | Initial API documentation |