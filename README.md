# Birthday Wishes Service

The Birthday Wishes Service is a Node.js application designed to handle birthday wishes using a multi-worker system for processing wishes in parallel. This service supports the following features:

- Adding birthday wishes to a processing queue
- Checking the status of wishes
- Retrieving the result of processed wishes
- Handling of worker lifecycle

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Worker Lifecycle Management](#worker-lifecycle-management)
- [Testing](#testing)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/rahulthakkar796/birthday-wishes.git
   cd birthday-wishes
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the server:

   ```bash
   npm start
   ```

## Usage

To use the Birthday Wishes Service, you can send requests to the provided endpoints. The server runs on port `3000` by default.

## API Endpoints

### 1. Prepare Wishes

**Endpoint:** `POST /prepare-wishes`

**Description:** Add a birthday wish to the processing queue.

**Request Body:**

```json
{
  "wishes": "string",
  "from": "string",
  "to": "string"
}
```

**Response:**

```json
{
  "uuid": "string"
}
```

### 2. Check Wishes Status

**Endpoint:** `GET /check-wishes-status/:uuid`

**Description:** Check the status of a birthday wish.

**Response:**

```json
{
  "status": "queued | in_progress | completed | not_found"
}
```

### 3. Get Result

**Endpoint:** `GET /get-result/:uuid`

**Description:** Retrieve the result of a processed wish.

**Response:**

```json
{
  "pow_nonce": "number",
  "hash": "string"
}
```

## Worker Lifecycle Management

The service uses worker threads to process wishes concurrently. The worker lifecycle management ensures that:

- The number of active workers does not exceed the maximum limit.
- Workers are properly incremented and decremented to reflect the active worker count.
- Workers are terminated properly after processing is complete.

## Testing

To ensure the application works as expected, you can run the included test suite. The tests cover various aspects such as API endpoints, worker lifecycle management, and error handling.

Run the tests using the following command:

```bash
npm test
```
